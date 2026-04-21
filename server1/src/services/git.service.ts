import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import { env } from '../config/env'
import { repoExists, getGitHubOwner } from './github.service'


// Helper: run a shell command inside a specific directory
const exec = (cmd: string, cwd: string): string => {
  return execSync(cmd, { cwd, encoding: 'utf-8' }).toString().trim()
}

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
  
  try {
    // 1. Verify repo exists BEFORE pushing
    console.log(`[Git Service] 🔍 Verifying repository existence for owner [${owner}]: ${newRepoName}`);
    const exists = await repoExists(newRepoName, owner);
    if (!exists) {
        const verifyErr = new Error(`Repository was not created before git push: ${newRepoName} not found on GitHub.`);
        (verifyErr as any).step = 'GIT_REPO_VERIFY';
        throw verifyErr;
    }

    // 2. Simple Clone
    const cloneCmd = `git clone --depth 1 ${sourceUrl} "${localPath}"`;
    console.log(`[Git Service] ⬇️ Executing: ${cloneCmd}`);
    try {
        execSync(cloneCmd, { stdio: 'pipe' });
        console.log(`[Git Service] ✅ Clone successful.`);
    } catch (err: any) {
        console.error(`[Git Service] ❌ Clone failed for URL: ${sourceUrl}`);
        if (err.stderr) console.error(`[Git Service] Stderr: ${err.stderr.toString()}`);
        err.step = 'GIT_CLONE_TEMPLATE';
        throw err
    }
    
    // 3. WIPE HISTORY
    const gitDir = path.join(localPath, '.git')
    if (fs.existsSync(gitDir)) {
        try {
            console.log(`[Git Service] 🧹 Wiping template history...`);
            fs.rmSync(gitDir, { recursive: true, force: true });
        } catch (err: any) {
            console.error(`[Git Service] ❌ Failed to wipe .git directory:`, err.message);
            err.step = 'GIT_CLEANUP_TEMPLATE';
            throw err;
        }
    }

    // 4. Patch
    if (patchCallback) {
        console.log(`[Git Service] 🩹 Patching template files...`);
        patchCallback(localPath)
    }

    // 5. Fresh Start
    console.log(`[Git Service] ✨ Initializing fresh repository...`)
    execSync(`git init`, { cwd: localPath })
    execSync(`git config user.email "${env.GIT_USER_EMAIL}"`, { cwd: localPath })
    execSync(`git config user.name "${env.GIT_USER_NAME}"`,   { cwd: localPath })
    
    console.log(`[Git Service] 📝 Committing files...`)
    execSync(`git add .`, { cwd: localPath })
    execSync(`git commit -m "Initial commit"`, { cwd: localPath })

    // 6. Connect and PUSH
    console.log(`[Git Service] 🔗 Connecting to GitHub remote...`)
    execSync(`git remote add origin ${newUrl}`, { cwd: localPath })
    
    // Log exact remote configuration
    const remotes = execSync(`git remote -v`, { cwd: localPath }).toString();
    console.log(`[Git Service] 🚩 Configured Remotes:\n${remotes}`);

    execSync(`git branch -M main`, { cwd: localPath })
    
    console.log(`[Git Service] 🚀 Pushing to origin main...`)
    execSync(`git push -u origin main`, { cwd: localPath, stdio: 'pipe' })
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
  execSync(`git clone ${url} "${localPath}"`)
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
