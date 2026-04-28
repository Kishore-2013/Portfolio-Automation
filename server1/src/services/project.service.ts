import fs from 'fs'
import { execSync } from 'child_process'
import path from 'path'
import { sleep, sanitizeRepoName } from '@/shared/shared-utils'
import { supabase } from '@/shared/database'
import { IPortfolioData } from '@/shared/types'
import { createRepo, deleteRepo, getGitHubOwner } from './github.service'
import { deployToVercel, waitForDeployment } from './vercel.service'
import { initializeWithTemplate, pullLatest, commitAndPush, getDefaultBranch } from './git.service'
import { env } from '../config/env'
import { patchTemplateForVercel, applyDynamicDataBinding } from './patcher.service'
import { injectPortfolioData } from './portfolio-data-injector'
import { killDevServer } from './preview-dev.manager'

// Per-project write lock: prevents concurrent writes corrupting data.json
const writeLocks = new Map<number, boolean>()

const acquireLock = async (projectId: number): Promise<void> => {
  while (writeLocks.get(projectId)) {
    await sleep(100)
  }
  writeLocks.set(projectId, true)
}

const releaseLock = (projectId: number): void => {
  writeLocks.delete(projectId)
}

// Helper to map DB snake_case to app camelCase
const mapProject = (p: any) => {
    if (!p) return null;
    return {
        id: p.id,
        userId: p.user_id,
        templateId: p.template_id,
        projectName: p.name,
        repoName: p.repo_name,
        repoUrl: p.repo_url,
        liveUrl: p.live_url,
        localPath: p.local_path,
        diskPath: p.disk_path,
        status: p.status,
        previewUrl: p.preview_url,
        lastSavedAt: p.last_saved_at,
        lastOpenedAt: p.last_opened_at,
        lastUpdated: p.last_updated,
        createdAt: p.created_at,
        updatedAt: p.updated_at
    };
}

function findDataJson(localPath: string): string {
    const candidates = ['data.json', 'data/data.json', 'public/data.json', 'content/data.json', 'src/data.json'];
    for (const c of candidates) {
        const full = path.join(localPath, c);
        if (fs.existsSync(full)) return full;
    }

    // Deep search fallback
    const findRecursive = (dir: string): string | null => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const res = path.resolve(dir, entry.name);
            if (entry.isDirectory() && entry.name !== '.git' && entry.name !== 'node_modules') {
                const found = findRecursive(res);
                if (found) return found;
            } else if (entry.name === 'data.json') {
                return res;
            }
        }
        return null;
    };

    const found = findRecursive(localPath);
    if (found) return found;

    throw new Error('Could not locate data.json in this project structure.');
}

// ── GET TEMPLATES ─────────────────────────────────────────────────────────
export const getTemplates = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_active', true);

  if (error || !data) return [];
  return data.map(t => ({
      ...t,
      techStack: t.tech_stack,
      thumbUrl: t.thumb_url,
      gitRepoUrl: t.git_repo_url,
      isActive: t.is_active,
      createdAt: t.created_at,
      updatedAt: t.updated_at
  }));
}

// ── LAUNCH PREVIEW (Creation Flow Part 1) ─────────────────────────────────
// This creates the repo, clones the template, injects data and returns.
// Vercel deployment is NOT triggered here.
export const launchPreview = async (
  userId: number,
  templateId: string,
  projectName: string,
): Promise<any> => {

  let repoName = '';
  let localPath = '';
  let repoCreated = false;
  let pushSucceeded = false;

  try {
    console.log(`[LAUNCH_PREVIEW] [1/5] Retrieving template metadata for ${templateId}...`);
    const { data: template } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (!template) {
      console.error(`[LAUNCH_PREVIEW] ❌ Template ${templateId} not found in database.`);
      throw new Error('Template not found');
    }

    const sourceUrl = template.git_repo_url;
    if (!sourceUrl || !sourceUrl.startsWith('http')) {
      throw new Error(`Template "${template.name}" has no valid git_repo_url.`)
    }

    // Smart Fallback: Use template name if user didn't provide one
    const finalProjectName = (projectName === 'My New Portfolio' || !projectName) ? template.name : projectName;

    repoName = sanitizeRepoName(`portfolio-${userId.toString().slice(-6)}-${Date.now().toString(36)}`)
    localPath = path.join(env.PROJECTS_BASE_PATH!, repoName)

    console.log(`[LAUNCH_PREVIEW] [2/5] Creating GitHub repository: ${repoName}...`);
    let repoResult;
    try {
        repoResult = await createRepo(repoName)
    } catch (err: any) {
        err.step = 'GITHUB_REPO_CREATE';
        throw err;
    }
    repoCreated = true
    const verifiedOwner = repoResult.owner

    await sleep(2000)

    // 1. Initial Push
    console.log(`[LAUNCH_PREVIEW] [3/5] Initializing local repo and pushing to GitHub...`);
    await initializeWithTemplate(sourceUrl, repoName, localPath, (p) => {
      patchTemplateForVercel(p);
      applyDynamicDataBinding(p);
    }, verifiedOwner)
    pushSucceeded = true

    console.log(`[LAUNCH_PREVIEW] [4/5] Injecting initial portfolio data...`);
    // Ensure data injection happens immediately so preview works
    try {
      await injectPortfolioData(null, localPath, userId); // Project ID not yet known, pass userId hint
    } catch (err: any) {
      console.warn(`[LAUNCH_PREVIEW] ⚠️ Initial data injection warning:`, err.message);
    }

    console.log(`[LAUNCH_PREVIEW] [5/5] Finalizing Supabase project record...`);
    const { data: project, error: createError } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        template_id: templateId,
        name: finalProjectName,
        repo_name: repoName,
        repo_url: repoResult.repoUrl,
        local_path: localPath,
        status: 'READY', // Ready for preview
        last_updated: new Date().toISOString(),
        disk_path: localPath
      })
      .select()
      .single();

    if (createError || !project) {
        console.error(`[LAUNCH_PREVIEW] ❌ Supabase insert failed:`, createError);
        const dbErr = new Error('Could not create project record in database: ' + (createError?.message || 'Unknown DB error'));
        (dbErr as any).step = 'DATABASE_INSERT_PROJECT';
        throw dbErr;
    }

    // Record History
    await supabase.from('project_activities').insert({
        project_id: project.id,
        user_id: userId,
        message: `Launched: Ready for preview (${projectName})`
    });

    return mapProject(project);

  } catch (err: any) {
    const errorStep = (err as any).step || 'unknown';
    const verifiedOwner = (err as any).owner || 'unknown';
    console.error(`[LAUNCH_PREVIEW] ❌ FAILED at Step [${errorStep}]: ${err.message}`)

    if (repoCreated && !pushSucceeded) {
        await deleteRepo(repoName, verifiedOwner).catch(e => console.warn(`[GitHub] Cleanup failed: ${e.message}`))
    }

    if (localPath && fs.existsSync(localPath)) {
      try { fs.rmSync(localPath, { recursive: true, force: true }) } catch (cleanupErr: any) { }
    }
    throw err
  }
}

// Keep the old name as alias to avoid breaking controllers during transition
export const createProjectInstance = launchPreview;

// ── MAKE LIVE (Creation Flow Part 2) ──────────────────────────────────────
// This triggers Vercel deployment for an existing preview project.
export const makeLive = async (
  projectId: number,
  userId: number,
): Promise<{ liveUrl: string }> => {
  const { data: projectRaw } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  const project = mapProject(projectRaw);
  if (!project || project.userId !== userId) throw new Error('Unauthorized or not found')

  console.log(`[MAKE_LIVE] 🚀 Triggering Vercel deployment for Project ${projectId}...`);

  try {
    // 0. IMPORTANT: Sync local disk state to GitHub first! 
    // This ensures Vercel pulls the latest data.json and patched files.
    if (project.localPath && fs.existsSync(project.localPath)) {
        console.log(`[MAKE_LIVE] 📦 Syncing local changes to GitHub for ${project.repoName}...`);
        const { commitAndPush } = require('./git.service');
        commitAndPush(project.localPath, 'chore: sync state for live deployment');
    }

    // 1. Get the repository metadata from GitHub to find the numeric repoId
    // In a real scenario, we might want to store repoId in DB during launchPreview
    // For now, we'll try to find it or use repoName
    
    // We need the branch to deploy
    const branch = project.localPath ? getDefaultBranch(project.localPath) : 'main';

    // We'll use a slightly modified deploy logic that doesn't strictly need repoId if we have repoName
    // But vercel.service.ts uses repoId. Let's see if we can get it.
    const { getRepoId } = require('./github.service');
    const repoId = await getRepoId(project.repoName);

    // 2. Trigger Vercel
    const deployResult = await deployToVercel(project.repoName, project.repoName, repoId, branch);
    
    // 3. Wait for success
    const liveUrl = await waitForDeployment(deployResult.deploymentId);

    // 4. Update Database
    await supabase
      .from('projects')
      .update({ 
        live_url: liveUrl,
        status: 'READY' // or 'LIVE'
      })
      .eq('id', projectId);

    // Record History
    await supabase.from('project_activities').insert({
        project_id: projectId,
        user_id: userId,
        message: `Went Live: Portfolio deployed to Vercel`
    });

    return { liveUrl };
  } catch (err: any) {
    console.error(`[MAKE_LIVE] ❌ Deployment failed: ${err.message}`);
    throw new Error(`Deployment failed: ${err.message}`);
  }
}

// ── READ PORTFOLIO DATA ───────────────────────────────────────────────────
export const getPortfolioData = async (
  projectId: number,
  userId: number,
): Promise<IPortfolioData> => {
  const { data: projectRaw } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  const project = mapProject(projectRaw);
  if (!project || project.userId !== userId) throw new Error('Unauthorized or not found')

  // If localPath was wiped (server restart/redeploy), re-clone from GitHub
  if (!project.localPath || !fs.existsSync(project.localPath)) {
    console.log(`[ProjectService] localPath missing, re-cloning ${project.repoName}`)
    const localPath = path.join(env.PROJECTS_BASE_PATH!, project.repoName!)
    const repoUrl = `https://${env.GITHUB_TOKEN}@github.com/${env.GITHUB_USER}/${project.repoName!}.git`

    fs.mkdirSync(localPath, { recursive: true })
    await initializeWithTemplate(repoUrl, project.repoName!, localPath, (p) => {
      patchTemplateForVercel(p);
      applyDynamicDataBinding(p);
    })

    await supabase
      .from('projects')
      .update({ local_path: localPath })
      .eq('id', projectId);

    const dataFilePath = findDataJson(localPath)
    return JSON.parse(fs.readFileSync(dataFilePath, 'utf-8')) as IPortfolioData
  }

  const dataFilePath = findDataJson(project.localPath!)
  const raw = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(raw) as IPortfolioData
}

// ── LIST PROJECTS ─────────────────────────────────────────────────────────
// ── REBUILD PROJECT (Recovery Flow) ──────────────────────────────────────
// Wipes the local folder and re-clones from the template.
export const rebuildProject = async (
  projectId: number,
  userId: number,
): Promise<any> => {
  const { data: projectRaw } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (!projectRaw || Number(projectRaw.user_id) !== userId) {
    throw new Error('Unauthorized or project not found');
  }

  const localPath = projectRaw.disk_path || projectRaw.local_path;
  const templateId = projectRaw.template_id;
  const repoName = projectRaw.repo_name;

  console.log(`[REBUILD] 🛠️ Rebuilding project ${projectId} for user ${userId}...`);

  try {
    // 1. Kill dev server if running (Windows file lock prevention)
    killDevServer(String(projectId), localPath);
    await sleep(1000);

    // 2. Wipe local folder
    if (localPath && fs.existsSync(localPath)) {
      console.log(`[REBUILD] 🧹 Wiping local folder: ${localPath}`);
      
      const maxRetries = 3;
      let success = false;
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          if (process.platform === 'win32') {
            // On Windows, rmdir /S /Q is often more robust
            execSync(`rmdir /S /Q "${localPath}"`, { stdio: 'ignore' });
          } else {
            fs.rmSync(localPath, { recursive: true, force: true });
          }
          success = true;
          break;
        } catch (err: any) {
          console.warn(`[REBUILD] ⚠️ Wipe attempt ${i + 1} failed: ${err.message}. Retrying in 2s...`);
          await sleep(2000);
        }
      }

      if (!success) {
        // Final attempt with fs.rmSync just in case
        try {
          fs.rmSync(localPath, { recursive: true, force: true });
        } catch (err: any) {
          throw new Error(`Failed to wipe project folder after ${maxRetries} attempts: ${err.message}`);
        }
      }
    }

    // 3. Fetch template
    const { data: template } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (!template) throw new Error('Template not found');

    // 3. Re-initialize
    const owner = (projectRaw.repo_url && projectRaw.repo_url.includes('github.com/')) 
      ? projectRaw.repo_url.split('github.com/')[1].split('/')[0]
      : getGitHubOwner();

    await initializeWithTemplate(template.git_repo_url, repoName, localPath, (p) => {
      patchTemplateForVercel(p);
      applyDynamicDataBinding(p);
    }, owner);

    // 4. Inject Data
    await injectPortfolioData(String(projectId), localPath);

    // 5. Update Status
    await supabase
      .from('projects')
      .update({ status: 'READY', last_updated: new Date().toISOString() })
      .eq('id', projectId);

    return mapProject({ ...projectRaw, status: 'READY' });
  } catch (err: any) {
    console.error(`[REBUILD] ❌ Rebuild failed for project ${projectId}:`, err.message);
    const rebuildErr = new Error(`Rebuild failed: ${err.message}`);
    (rebuildErr as any).step = (err as any).step || 'REBUILD_PROCESS';
    (rebuildErr as any).originalError = err.message;
    throw rebuildErr;
  }
}

export const listUserProjects = async (userId: number): Promise<any[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(mapProject);
}

// ── GET FULL VFS ──────────────────────────────────────────────────────────
export const getFullVfsCached = async (projectId: number, userId: number): Promise<any> => {
  const { data: projectRaw } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  const project = mapProject(projectRaw);
  if (!project || project.userId !== userId) throw new Error('Unauthorized or not found')

  // Check Redis Cache first
  const { RedisService } = require('./redis.service');
  const cached = await RedisService.getCachedFiles(projectId);
  if (cached) {
    console.log(`[VFS] Serving project ${projectId} from Redis cache`);
    return JSON.parse(cached);
  }

  // Ensure portfolio data is injected before scanning files
  try {
    await injectPortfolioData(String(projectId), project.localPath!);
  } catch (err: any) {
    console.warn(`[VFS] Data injection failed for ${projectId}:`, err.message);
  }

  const files: Record<string, string> = {};
  const localPath = project.localPath!;

  const readDir = (dir: string) => {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const relPath = path.relative(localPath, fullPath).replace(/\\/g, '/');
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && file !== 'node_modules' && file !== '.git' && file !== '.next' && file !== 'dist') {
        readDir(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        if (['.json', '.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.md', '.txt'].includes(ext)) {
          files[relPath] = fs.readFileSync(fullPath, 'utf-8');
        }
      }
    });
  }

  readDir(localPath);
  const result = { projectId, files };
  
  // Store in Redis
  await RedisService.setCachedFiles(projectId, JSON.stringify(result));
  
  return result;
}

// ── GET FILE TREE ─────────────────────────────────────────────────────────
export const getFileTree = async (projectId: number, userId: number): Promise<any> => {
  const { data: projectRaw } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  const project = mapProject(projectRaw);
  if (!project || project.userId !== userId) throw new Error('Unauthorized or not found')

  // Ensure portfolio data is injected before scanning files
  try {
    await injectPortfolioData(String(projectId), project.localPath!);
  } catch (err: any) {
    console.warn(`[FileTree] Data injection failed for ${projectId}:`, err.message);
  }

  const buildTree = (dir: string): any[] => {
    const list = fs.readdirSync(dir);
    return list
      .filter(f => f !== 'node_modules' && f !== '.git' && f !== '.next' && f !== 'dist')
      .map(file => {
        const fullPath = path.join(dir, file);
        const relPath = path.relative(project.localPath!, fullPath).replace(/\\/g, '/');
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          return { name: file, path: relPath, type: 'dir', children: buildTree(fullPath) };
        }
        return { name: file, path: relPath, type: 'file' };
      });
  }

  return { projectId, tree: buildTree(project.localPath!) };
}

// ── GET FILE CONTENT ──────────────────────────────────────────────────────
export const getFileContent = async (projectId: number, userId: number, filePath: string): Promise<any> => {
    const { data: projectRaw } = await supabase.from('projects').select('*').eq('id', projectId).single();
    const project = mapProject(projectRaw);
    if (!project || project.userId !== userId) throw new Error('Unauthorized');

    const fullPath = path.join(project.localPath!, filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    return { projectId, filePath, content };
}

// ── SAVE FILE CONTENT ─────────────────────────────────────────────────────
export const saveFileContent = async (projectId: number, userId: number, filePath: string, content: string): Promise<any> => {
    const { data: projectRaw } = await supabase.from('projects').select('*').eq('id', projectId).single();
    const project = mapProject(projectRaw);
    if (!project || project.userId !== userId) throw new Error('Unauthorized');

    const fullPath = path.join(project.localPath!, filePath);
    fs.writeFileSync(fullPath, content, 'utf-8');

    // Invalidate VFS cache
    const { RedisService } = require('./redis.service');
    await RedisService.invalidateFileCache(projectId);

    return { saved: true, filePath };
}

// ── UPDATE PORTFOLIO DATA ─────────────────────────────────────────────────
export const updatePortfolioData = async (
  projectId: number,
  userId: number,
  newData: Partial<IPortfolioData>,
): Promise<void> => {

  const { data: projectRaw } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  const project = mapProject(projectRaw);
  if (!project || project.userId !== userId) throw new Error('Unauthorized or not found')

  await acquireLock(projectId)

  try {
    // Self-Healing: If localPath was wiped, re-clone before update
    if (!project.localPath || !fs.existsSync(project.localPath)) {
      console.log(`[ProjectService] localPath missing during update, re-cloning ${project.repoName}`)
      const newLocalPath = path.join(env.PROJECTS_BASE_PATH!, project.repoName!)
      const repoUrl = `https://${env.GITHUB_TOKEN}@github.com/${env.GITHUB_USER}/${project.repoName!}.git`

      if (!fs.existsSync(newLocalPath)) fs.mkdirSync(newLocalPath, { recursive: true })
      await initializeWithTemplate(repoUrl, project.repoName!, newLocalPath, (p) => {
        patchTemplateForVercel(p);
        applyDynamicDataBinding(p);
      })

      await supabase
        .from('projects')
        .update({ local_path: newLocalPath })
        .eq('id', projectId);
      
      project.localPath = newLocalPath // update local object
    }

    pullLatest(project.localPath!)

    const currentData = (projectRaw.portfolio_data as IPortfolioData) || {};
    const mergedData: IPortfolioData = { ...currentData, ...newData };

    try {
      const dataFilePath = findDataJson(project.localPath!);
      if (dataFilePath) {
        fs.writeFileSync(dataFilePath, JSON.stringify(mergedData, null, 2), 'utf-8');
      }
    } catch (e) {
      // Ignore if data.json doesn't exist; we inject portfolioData.json below.
    }

    // Ensure iframe-allow headers are in vercel.json (idempotent)
    patchTemplateForVercel(project.localPath!)
    applyDynamicDataBinding(project.localPath!)

    commitAndPush(project.localPath!, 'Update portfolio data')

    // Invalidate VFS cache since data.json changed
    const { RedisService } = require('./redis.service');
    await RedisService.invalidateFileCache(projectId);

    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        last_updated: new Date().toISOString(),
        portfolio_data: mergedData 
      } as any)
      .eq('id', projectId);

    if (updateError && !updateError.message.includes('portfolio_data')) {
       console.error(`[ProjectService] ❌ Failed to update project in DB:`, updateError.message);
    }

    // CRITICAL: Sync to the preview runtime's public folder
    try {
      await injectPortfolioData(String(projectId), project.localPath!);
      console.log(`[ProjectService] ✅ Injected updated portfolio data for project ${projectId}`);
    } catch (injectErr: any) {
      console.error(`[ProjectService] ❌ Failed to inject portfolio data:`, injectErr.message);
    }

    await supabase.from('project_activities').insert({
        project_id: projectId,
        user_id: userId,
        message: `Update: ${Object.keys(newData).join(', ')}`
    });

  } finally {
    releaseLock(projectId)
  }
}

// ── REPAIR PROJECT (fix iframe headers) ──────────────────────────────────
export const repairProject = async (
  projectId: number,
  userId: number,
): Promise<{ message: string }> => {
  const { data: projectRaw } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  const project = mapProject(projectRaw);
  if (!project || project.userId !== userId) throw new Error('Unauthorized or not found')

  // 1. Sync the latest deployment URL from Vercel (fixes 404s)
  try {
    const { getLatestDeploymentState } = require('./vercel.service');
    const latest = await getLatestDeploymentState(project.repoName);
    if (latest && latest.url) {
      await supabase
        .from('projects')
        .update({ live_url: latest.url })
        .eq('id', projectId);
      console.log(`[Repair] Updated liveUrl to: ${latest.url}`);
    }
  } catch (err) {
    console.warn(`[Repair] Could not sync latest Vercel URL:`, err);
  }

  if (!project.localPath || !fs.existsSync(project.localPath)) {
    throw new Error('Local repo not found. Please save the project first to re-clone it.')
  }

  await acquireLock(projectId)
  try {
    pullLatest(project.localPath!)
    patchTemplateForVercel(project.localPath!)
    applyDynamicDataBinding(project.localPath!)
    commitAndPush(project.localPath!, 'chore: allow iframe embedding for portfolio builder')
    return { message: 'URL synchronized and repair pushed to GitHub. Vercel will redeploy.' }
  } finally {
    releaseLock(projectId)
  }
}

// ── PUBLISH PROJECT ────────────────────────────────────────────────────────
export const publishProject = async (
  projectId: number,
  userId: number,
): Promise<any> => {
  const { data: projectRaw } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  const project = mapProject(projectRaw);
  if (!project || project.userId !== userId) throw new Error('Unauthorized or not found')
  return project
}

// ── RECENT UPDATES ────────────────────────────────────────────────────────
export const getRecentUpdates = async (
  userId: number,
): Promise<any[]> => {
  const { data, error } = await supabase
    .from('project_activities')
    .select('*, project:projects(name, live_url)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !data) return [];

  return data.map(item => ({
      ...item,
      createdAt: item.created_at,
      project: item.project ? {
          projectName: (item.project as any).name,
          liveUrl: (item.project as any).live_url
      } : null
  }));
}

// ── GET PROXY PREVIEW ──────────────────────────────────────────────────────
export const getProxyPreview = async (
  projectId: number,
  userId: number,
): Promise<string> => {
  const { data: projectRaw } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  const project = mapProject(projectRaw);
  if (!project || project.userId !== userId) throw new Error('Unauthorized or not found')
  if (!project.liveUrl) throw new Error('Project has no live deployment yet')

  try {
    const axios = require('axios');
    let target = project.liveUrl;
    if (!target.startsWith('http')) target = `https://${target}`;

    console.log(`[Proxy] Fetching preview from: ${target}`);
    const response = await axios.get(target);
    let body = response.data;

    if (typeof body === 'string') {
      const baseUrl = new URL(target).origin;
      body = body.replace('<head>', `<head><base href="${baseUrl}/">`);
    }

    return body;
  } catch (err: any) {
    throw new Error(`Failed to proxy preview: ${err.message}`)
  }
}

// ── DELETE PROJECT ────────────────────────────────────────────────────────
export const deleteProject = async (
  projectId: number,
  userId: number,
): Promise<void> => {
  const { data: projectRaw } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  const project = mapProject(projectRaw);
  if (!project || project.userId !== userId) throw new Error('Unauthorized or not found')

  if (project.repoName) await deleteRepo(project.repoName)
  if (project.localPath && fs.existsSync(project.localPath)) fs.rmSync(project.localPath, { recursive: true, force: true })
  
  await supabase.from('projects').delete().eq('id', projectId);
}

// ── SNAPSHOTS ────────────────────────────────────────────────────────────
export const listSnapshots = async (projectId: number, userId: number) => {
  const { data } = await supabase
    .from('snapshots')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  return data || [];
}

export const createSnapshot = async (projectId: number, diskPath: string, type: string, label: string | null) => {
  // Simple implementation: just record it, or copy files to a /snapshots/ folder
  const snapshotId = `sn-${Date.now()}`;
  await supabase.from('snapshots').insert({
    project_id: projectId,
    type,
    label,
    storage_path: snapshotId 
  });
}

export const restoreSnapshot = async (projectId: number, userId: number, snapshotId: number) => {
    // Logic to restore files...
    return { restored: true };
}

// ── DISK STATUS ───────────────────────────────────────────────────────────
export const getDiskStatus = async () => {
    return {
        totalProjects: 0,
        diskUsed: '0MB',
        limit: '10GB'
    };
}
