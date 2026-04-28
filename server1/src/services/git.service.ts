import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import { env } from '../config/env'
import { repoExists, getGitHubOwner } from './github.service'
import { sanitizeGitHubUrl } from '../utils/github.utils'


// Helper: Find the git executable (especially for Windows)
const getGitCmd = (): string => {
  if (process.platform !== 'win32') return 'git';
  
  // Standard Windows installation paths
  const standardPaths = [
    'C:\\Program Files\\Git\\cmd\\git.exe',
    'C:\\Program Files\\Git\\bin\\git.exe',
    path.join(process.env.USERPROFILE || '', 'AppData\\Local\\Programs\\Git\\cmd\\git.exe')
  ];

  for (const p of standardPaths) {
    if (fs.existsSync(p)) return `"${p}"`;
  }

  return 'git'; // Fallback to PATH
};

const GIT_CMD = getGitCmd();

// Helper: run a shell command inside a specific directory
const exec = (cmd: string, cwd: string): string => {
  // Replace 'git ' with the resolved GIT_CMD
  const finalCmd = cmd.startsWith('git ') ? cmd.replace('git ', `${GIT_CMD} `) : cmd;
  return execSync(finalCmd, { cwd, encoding: 'utf-8' }).toString().trim();
};

// Uses GITHUB_ORG if set, fallback to GITHUB_USER consistently — matches createRepo logic
// Uses verified owner if provided, fallback to environment consistently
const authUrl = (repoName: string, ownerOverride?: string): string => {
  const owner = ownerOverride || getGitHubOwner();
  console.log(`[GIT_PUSH] owner: ${owner}`);
  console.log(`[GIT_PUSH] repo: ${repoName}`);
  
  // Defensive validation for core env variables
  if (!env.GITHUB_TOKEN) throw new Error("Missing GITHUB_TOKEN in environment");
  if (!owner) throw new Error("Missing GITHUB_ORG or GITHUB_USER in environment");
  if (!repoName) throw new Error("repoName is undefined in authUrl generation");

  // Use x-access-token format for PATs. Ensure NO trailing slash after .git
  const remote = `https://x-access-token:${env.GITHUB_TOKEN}@github.com/${owner}/${repoName}.git`.replace(/\.git\/$/, '.git');
  console.log(`[GIT_PUSH] remote: ${remote.replace(env.GITHUB_TOKEN!, '***')}`); // Mask token in logs
  return remote;
}



// Automatically detects whether the source template uses 'main' or 'master'
export const getDefaultBranch = (localPath: string): string => {
  try {
    const result = exec('git branch -a', localPath)
    // 1. Check local active branch
    if (result.includes('* main')) return 'main'
    if (result.includes('* master')) return 'master'
    // 2. Check remote branches
    if (result.includes('remotes/origin/main')) return 'main'
    if (result.includes('remotes/origin/master')) return 'master'
    // 3. Check for any current branch name as fallback
    const currentBranch = exec('git branch --show-current', localPath)
    if (currentBranch) return currentBranch
    return 'main'
  } catch {
    return 'main'
  }
}

// ── Clone template & Push to NEW repo ─────────────────────────────────────
export const initializeWithTemplate = async (
  sourceUrl:    string,
  newRepoName:  string,
  localPath:    string,
  patchCallback?: (path: string) => void,
  ownerOverride?: string
): Promise<void> => {
  const owner = ownerOverride || getGitHubOwner(); 
  const newUrl = authUrl(newRepoName, owner)
  
  // 1. Sanitize source URL and add token for reliability
  let cleanSourceUrl: string;
  try {
    const rawClean = sanitizeGitHubUrl(sourceUrl);
    // Inject token for cloning if it's a github.com URL
    if (rawClean.includes('github.com') && env.GITHUB_TOKEN) {
      cleanSourceUrl = rawClean.replace('https://', `https://x-access-token:${env.GITHUB_TOKEN}@`);
    } else {
      cleanSourceUrl = rawClean;
    }
    console.log(`[Git Service] 🧹 Sanitized URL: ${sourceUrl} -> ${cleanSourceUrl.replace(env.GITHUB_TOKEN || '', '***')}`);
  } catch (err: any) {
    const sanitizeErr = new Error(`Invalid Template URL: ${err.message}`);
    (sanitizeErr as any).step = 'GIT_URL_VALIDATION';
    throw sanitizeErr;
  }

  try {
    // 2. Verify repo exists BEFORE pushing (with retry loop)
    console.log(`[Git Service] 🔍 Verifying repository existence for owner [${owner}]: ${newRepoName}`);
    let exists = false;
    for (let i = 0; i < 5; i++) {
      exists = await repoExists(newRepoName, owner);
      if (exists) break;
      console.log(`[Git Service] ⏳ Repo not visible yet, retrying in 2s... (${i+1}/5)`);
      await new Promise(r => setTimeout(r, 2000));
    }

    if (!exists) {
        const verifyErr = new Error(`Repository was not created before git push: ${newRepoName} not found on GitHub.`);
        (verifyErr as any).step = 'GIT_REPO_VERIFY';
        throw verifyErr;
    }

    // 3. Simple Clone
    const cloneCmd = `${GIT_CMD} clone --depth 1 ${cleanSourceUrl} "${localPath}"`;
    console.log(`[Git Service] ⬇️ Executing clone (token masked)...`);
    try {
        execSync(cloneCmd, { stdio: 'pipe' });
        console.log(`[Git Service] ✅ Clone successful.`);
    } catch (err: any) {
        const stderrStr = err.stderr?.toString() || "";
        console.error(`[Git Service] ❌ Clone failed: ${stderrStr}`);
        
        // Check for common git errors and make them user-friendly
        let errorMsg = `Blueprint download failed.`;
        
        if (stderrStr.includes("not found")) {
            errorMsg = `The template repository was not found. Please check if the URL is correct and public.`;
        } else if (stderrStr.includes("permission denied")) {
            errorMsg = `Access denied to the template repository. Please ensure it is a public repository.`;
        }
        
        const finalErr = new Error(errorMsg);
        (finalErr as any).step = 'GIT_CLONE_TEMPLATE';
        (finalErr as any).originalError = stderrStr;
        throw finalErr;
    }
    
    // 3. WIPE HISTORY
    const gitDir = path.join(localPath, '.git')
    if (fs.existsSync(gitDir)) {
        try {
            console.log(`[Git Service] 🧹 Wiping template history...`);
            try {
                fs.rmSync(gitDir, { recursive: true, force: true });
            } catch (err: any) {
                console.warn(`[Git Service] ⚠️ Initial .git wipe failed, retrying in 1s...`);
                await new Promise(r => setTimeout(r, 1000));
                fs.rmSync(gitDir, { recursive: true, force: true });
            }
        } catch (err: any) {
            console.error(`[Git Service] ❌ Failed to wipe .git directory:`, err.message);
            const cleanErr = new Error(`Failed to clean template history: ${err.message}`);
            (cleanErr as any).step = 'GIT_CLEANUP_TEMPLATE';
            throw cleanErr;
        }
    }

    // 4. Patch
    if (patchCallback) {
        console.log(`[Git Service] 🩹 Patching template files...`);
        patchCallback(localPath)
    }

    // 5. Fresh Start
    console.log(`[Git Service] ✨ Initializing fresh repository...`)
    execSync(`${GIT_CMD} init`, { cwd: localPath })
    execSync(`${GIT_CMD} config user.email "${env.GIT_USER_EMAIL}"`, { cwd: localPath })
    execSync(`${GIT_CMD} config user.name "${env.GIT_USER_NAME}"`,   { cwd: localPath })
    
    console.log(`[Git Service] 📝 Committing files...`)
    execSync(`${GIT_CMD} add .`, { cwd: localPath })
    execSync(`${GIT_CMD} commit -m "Initial commit"`, { cwd: localPath })

    // 6. Connect and PUSH
    console.log(`[Git Service] 🔗 Connecting to GitHub remote...`)
    execSync(`${GIT_CMD} remote add origin ${newUrl}`, { cwd: localPath })
    
    // Log exact remote configuration
    const remotes = execSync(`${GIT_CMD} remote -v`, { cwd: localPath }).toString();
    console.log(`[Git Service] 🚩 Configured Remotes:\n${remotes}`);

    execSync(`${GIT_CMD} branch -M main`, { cwd: localPath })
    
    console.log(`[Git Service] 🚀 Pushing to origin main (force)...`)
    execSync(`${GIT_CMD} push -f -u origin main`, { cwd: localPath, stdio: 'pipe' })
    console.log(`[Git Service] ✅ Successfully pushed ${newRepoName} on branch main`)

  } catch (err: any) {
    console.error(`[Git Service] ❌ Git Push Error in ${newRepoName}:`, err.message);
    
    // Enrich error with metadata as requested for deep debugging
    err.step = err.step || 'GIT_PUSH';
    err.owner = owner;
    err.repoName = newRepoName;
    err.remoteUrl = newUrl.replace(env.GITHUB_TOKEN!, '***');

    throw err;
  }
}



// ── Clone EXISTING repo from your account ──────────────────────────────────
export const cloneRepo = (repoName: string, localPath: string): void => {
  const url = authUrl(repoName)
  execSync(`${GIT_CMD} clone ${url} "${localPath}"`)
  console.log(`[Git] Cloned ${repoName} to ${localPath}`)
}

// ── Pull latest from remote ───────────────────────────────────────────────
// Always pull before writing to avoid conflicts. Detect branch dynamically.
export const pullLatest = (localPath: string): void => {
  const branch = getDefaultBranch(localPath)
  try {
    exec(`git pull origin ${branch}`, localPath)
  } catch (err) {
    console.warn(`[Git] Pull failed for branch ${branch} (might be empty/new repo):`, err)
  }
}

// ── Commit and push data.json ─────────────────────────────────────────────
// Updated to handle multiple config files and dynamic branch names.
export const commitAndPush = (localPath: string, message: string): void => {
  const repoName = path.basename(localPath)

  // Configure git identity (required for commits to work)
  try {
    exec('git config user.email "bot@yourplatform.com"', localPath)
    exec('git config user.name "Portfolio Bot"', localPath)
  } catch { }

  // Stage ALL changes to ensure absolute consistency with Vercel
  try {
    exec('git add .', localPath)
    console.log('[Git] Staged all changes using add .')
  } catch (err) {
    console.error('[Git] Failed to stage changes:', err)
  }

  // Check if there's actually something staged
  try {
    exec('git diff --cached --exit-code', localPath)
    console.log('[Git] No changes to commit')
    return
  } catch {
    // staged changes exist → proceed
  }

  // Detect branch dynamically (master vs main)
  const branch = getDefaultBranch(localPath)

  // Commit
  try {
    exec(`git commit -m "${message}"`, localPath)
  } catch (err) {
    console.error('[Git] Commit failed:', err)
    return
  }

  // Push to the detected branch
  try {
    exec(`git push ${authUrl(repoName)} ${branch}`, localPath)
    console.log(`[Git] Successfully pushed changes to ${repoName} on branch ${branch}`)
  } catch (err) {
    console.error(`[Git] Push failed for ${repoName}:`, err)
  }
}

// ── Delete local clone ────────────────────────────────────────────────────
// Called when user deletes their project.
export const deleteLocalRepo = (localPath: string): void => {
  if (fs.existsSync(localPath)) {
      try {
        fs.rmSync(localPath, { recursive: true, force: true })
      } catch (err) {
        console.warn(`[Git] Failed to wipe local path ${localPath}:`, err)
      }
  }
}
