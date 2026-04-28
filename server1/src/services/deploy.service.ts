import { supabase } from '@/shared/database';
import { logger } from '@/shared/shared-utils';
import { createRepo, getGitHubOwner } from './github.service';
import { initializeWithTemplate, commitAndPush } from './git.service';
import { deployToVercel, waitForDeployment } from './vercel.service';
import { injectPortfolioData } from './portfolio-data-injector';
import { env } from '../config/env';
import * as path from 'path';
import * as fs from 'fs';

export class DeployService {
  /**
   * Performs a full deployment:
   * 1. Create GitHub Repo
   * 2. Clone & Setup Template
   * 3. Inject User Data
   * 4. Push to GitHub
   * 5. Trigger Vercel
   * 6. Update DB with results
   */
  static async fullDeployment(projectId: number, userId: number): Promise<string> {
    logger.info(`[DeployService] Starting full deployment for project ${projectId}`, { userId });

    let repoName = '';
    let diskPath = '';

    try {
      // 1. Fetch project and user info
      const { data: project } = await supabase
        .from('projects')
        .select('*, templates(*)')
        .eq('id', projectId)
        .single();

      if (!project) throw new Error('Project not found');
      
      const template = project.templates;
      if (!template) throw new Error('Template not configured for project');

      repoName = `portfolio-${userId}-${Math.random().toString(36).substring(2, 7)}`;
      diskPath = path.join((env as any).INSTANCES_PATH || './instances', repoName);

      // Ensure instances path exists
      if (!fs.existsSync(path.dirname(diskPath))) {
        fs.mkdirSync(path.dirname(diskPath), { recursive: true });
      }

      // 2. Create GitHub Repo
      logger.info(`[DeployService] Creating GitHub repo: ${repoName}`);
      const { repoId, repoUrl } = await createRepo(repoName);

      // 3. Initialize with template
      logger.info(`[DeployService] Initializing with template: ${template.github_url}`);
      await initializeWithTemplate(
        template.github_url,
        repoName,
        diskPath,
        (p) => {
          // Sync data right after clone but before initial push
          logger.info(`[DeployService] Injecting portfolio data...`);
        }
      );

      // 4. Inject Portfolio Data & Resume
      await injectPortfolioData(projectId.toString(), diskPath, userId);

      // 5. Final Commit & Push
      logger.info(`[DeployService] Pushing finalized code to GitHub`);
      await commitAndPush(diskPath, 'Sync: Injected portfolio data and resume');

      // 6. Trigger Vercel
      logger.info(`[DeployService] Triggering Vercel deployment`);
      const { deploymentId } = await deployToVercel(repoName, repoName, repoId);

      // 7. Update Project record with URLs
      await supabase
        .from('projects')
        .update({
          github_url: repoUrl,
          disk_path: diskPath,
          status: 'BUILDING'
        })
        .eq('id', projectId);

      // 8. Wait for Vercel (optional, can be done in background)
      const liveUrl = await waitForDeployment(deploymentId);

      // 9. Mark as LIVE
      await supabase
        .from('projects')
        .update({
          vercel_url: liveUrl,
          status: 'LIVE'
        })
        .eq('id', projectId);

      logger.info(`[DeployService] Deployment complete! Live at: ${liveUrl}`);
      return liveUrl;

    } catch (err: any) {
      logger.error(`[DeployService] Deployment FAILED:`, err);
      
      await supabase
        .from('projects')
        .update({ status: 'FAILED' })
        .eq('id', projectId);

      throw err;
    }
  }
}
