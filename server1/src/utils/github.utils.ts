/**
 * Sanitizes and validates a GitHub URL for use with git clone.
 * Converts browser URLs (e.g., https://github.com/user/repo/tree/master)
 * into clean cloneable URLs (e.g., https://github.com/user/repo.git).
 */
export function sanitizeGitHubUrl(url: string): string {
  if (!url) {
    throw new Error("GitHub URL is required.");
  }

  // 1. Basic validation: Must be a GitHub URL
  if (!url.toLowerCase().includes("github.com")) {
    throw new Error("Invalid GitHub URL. Please provide a valid GitHub repository link.");
  }

  try {
    // 2. Handle both HTTPS and SSH formats
    // We want to extract the owner and repo name
    let cleanUrl = url.trim();

    // Remove trailing slashes
    cleanUrl = cleanUrl.replace(/\/+$/, "");

    // 3. Extract owner/repo using regex
    // Supports:
    // https://github.com/owner/repo
    // https://github.com/owner/repo.git
    // https://github.com/owner/repo/tree/main
    // git@github.com:owner/repo.git
    const regex = /(?:https?:\/\/github\.com\/|git@github\.com:)([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/|$)/i;
    const match = cleanUrl.match(regex);

    if (!match || match.length < 3) {
      throw new Error("Could not parse GitHub repository owner and name from the provided URL.");
    }

    const owner = match[1];
    const repo = match[2];

    // 4. Reconstruct as a standard HTTPS clone URL
    return `https://github.com/${owner}/${repo}.git`;
  } catch (error: any) {
    throw new Error(`Failed to process GitHub URL: ${error.message}`);
  }
}

/**
 * Validates if a string is a potentially valid GitHub repository URL
 */
export function isValidGitHubUrl(url: string): boolean {
  try {
    sanitizeGitHubUrl(url);
    return true;
  } catch {
    return false;
  }
}
