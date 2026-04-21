import { Request, Response, NextFunction } from 'express';
import { supabase } from '@/shared/database';
import { sendSuccess, NotFoundError, ForbiddenError } from '@/shared/shared-utils';
import { deployQueueInstance } from '../jobs/deploy.worker';

export class DeployController {
  /**
   * POST /api/deploy/:projectId
   * Trigger a build and deploy
   */
  static async deploy(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const userId = Number(req.user!.userId);

      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (!project) throw new NotFoundError('Project');
      if (Number(project.user_id) !== userId) throw new ForbiddenError();

      // 1. Create deployment record
      const { data: deployment, error } = await supabase
        .from('deployments')
        .insert({
          project_id: projectId,
          user_id: userId,
          status: 'QUEUED'
        })
        .select()
        .single();

      if (error || !deployment) {
          throw new Error('Could not create deployment record: ' + error?.message);
      }

      // 2. Add to queue
      await deployQueueInstance.add({
        deployId: deployment.id,
        projectId,
        userId,
        diskPath: project.disk_path
      });

      return sendSuccess(res, { 
        deployId: deployment.id, 
        status: deployment.status 
      }, 202);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/deploy/:deployId/status
   * Poll deployment status
   */
  static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const deployId = Number(req.params.deployId);
      const userId = Number(req.user!.userId);

      const { data: deployment } = await supabase
        .from('deployments')
        .select('id, user_id, status, url, error')
        .eq('id', deployId)
        .single();

      if (!deployment) throw new NotFoundError('Deployment');
      if (Number(deployment.user_id) !== userId) throw new ForbiddenError();

      return sendSuccess(res, {
        status: deployment.status,
        url: deployment.url,
        error: deployment.error
      });
    } catch (error) {
      next(error);
    }
  }
}

