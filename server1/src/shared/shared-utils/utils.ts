export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const sanitizeRepoName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};
