import axios from 'axios'
import { env } from '../config/env'

// source of truth for owner logic
export const getGitHubOwner = () => env.GITHUB_ORG || env.GITHUB_USER;

const githubClient = axios.create({

  baseURL: 'https://api.github.com',
  timeout: 30000, 
  headers: {
    Authorization:  `token ${env.GITHUB_TOKEN}`,
    Accept:         'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  },
})

// ── Create a new repo from a template repo ───────────────────────────────
// Uses GitHub's "Generate from Template" API — NOT fork.
export const createRepoFromTemplate = async (
  templateRepo: string,    // e.g. "your-org/template-minimal"
  newRepoName:  string,    // e.g. "portfolio-user123-abc"
): Promise<{ repoName: string; repoUrl: string; cloneUrl: string }> => {

  console.log(`[GitHub API] Generating from template: ${templateRepo} -> ${newRepoName}`);
  const response = await githubClient.post(
    `/repos/${templateRepo}/generate`,
    {
      owner:                env.GITHUB_ORG,
      name:                 newRepoName,
      description:          `Portfolio site — ${newRepoName}`,
      private:              false,   // must be public for Vercel free tier
      include_all_branches: false,
    }
  )
  console.log(`[GitHub API] Created successfully: ${response.data.html_url}`);


  return {
    repoName: response.data.name,
    repoUrl:  response.data.html_url,
    cloneUrl: response.data.clone_url,
  }
}

// ── Create a NEW empty repo ──────────────────────────────────────────────
export const createRepo = async (
  newRepoName:  string,
): Promise<{ repoName: string; repoUrl: string; cloneUrl: string; repoId: number; owner: string }> => {

  // If GITHUB_ORG is provided and different from GITHUB_USER, we assume it's an organization.
  // GitHub's /user/repos endpoint is specifically for personal accounts.
  const useOrg = env.GITHUB_ORG && env.GITHUB_ORG !== env.GITHUB_USER;
  const endpoint = useOrg ? `/orgs/${env.GITHUB_ORG}/repos` : `/user/repos`;
  
  console.log(`[GitHub API] Creating empty repo: ${newRepoName} at ${endpoint} (Org Mode: ${!!useOrg})`);
  
  try {
    const response = await githubClient.post(
      endpoint,
      {
        name:                 newRepoName,
        description:          `Portfolio site — ${newRepoName}`,
        private:              false,   // must be public for Vercel free tier
        auto_init:            false,   // stay empty so we can push our own code
      }
    )
    console.log(`[GitHub API] Created successfully: ${response.data.html_url} (ID: ${response.data.id})`);

    return {
      repoName: response.data.name,
      repoUrl:  response.data.html_url,
      cloneUrl: response.data.clone_url,
      repoId:   response.data.id, 
      owner:    response.data.owner.login,
    }
  } catch (err: any) {
    // Fallback logic: If Org creation fails with 404, it might be a personal account misconfigured as an Org
    if (useOrg && err.response?.status === 404) {
      console.warn(`[GitHub API] Org-level creation failed with 404. Falling back to personal /user/repos...`);
      const retryResponse = await githubClient.post('/user/repos', {
        name:                 newRepoName,
        description:          `Portfolio site — ${newRepoName}`,
        private:              false,
        auto_init:            false,
      });
      return {
        repoName: retryResponse.data.name,
        repoUrl:  retryResponse.data.html_url,
        cloneUrl: retryResponse.data.clone_url,
        repoId:   retryResponse.data.id,
        owner:    retryResponse.data.owner.login,
      };
    }
    throw err;
  }
}



// ── Cleanup Helper: Delete a repo on failure ─────────────────────────────
export const deleteRepo = async (repoName: string, ownerOverride?: string): Promise<void> => {
  const owner = ownerOverride || getGitHubOwner();
  try {
      await githubClient.delete(`/repos/${owner}/${repoName}`)
      console.log(`[GitHub] Cleaned up orphaned repository: ${repoName}`)
  } catch (err) {
      console.warn(`[GitHub] Could not delete repo ${repoName}:`, err)
  }
}

// ── Check repo exists ────────────────────────────────────────────────────
export const repoExists = async (repoName: string, ownerOverride?: string): Promise<boolean> => {
  const owner = ownerOverride || getGitHubOwner();
  try {
    await githubClient.get(`/repos/${owner}/${repoName}`)
    return true
  } catch {
    return false
  }
}

