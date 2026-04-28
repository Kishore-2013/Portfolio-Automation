import { Request, Response, NextFunction } from 'express';
import { PreviewService } from '../services/preview.service';
import { sendSuccess } from '@/shared/shared-utils';

export class PreviewController {
  /** POST /api/preview/:projectId/start */
  static async start(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { userId } = req.user!;

      const result = await PreviewService.startPreview(
        Number(projectId),
        Number(userId),
      );
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/preview/:projectId/stop */
  static async stop(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { userId } = req.user!;

      await PreviewService.stopPreview(Number(projectId), Number(userId));
      return sendSuccess(res, { success: true });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/preview/:projectId/status */
  static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const result = await PreviewService.getStatus(projectId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/preview/:projectId/health
   * Lightweight TCP-probe for the frontend heartbeat. Returns quickly
   * without spawning a new server — just checks if the existing port is live.
   */
  static async healthCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const result = await PreviewService.healthCheck(projectId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
