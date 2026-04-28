import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service';
import { sendSuccess } from '@/shared/shared-utils';

export class AIController {
  /**
   * POST /api/ai/merge-resume
   * Body: { currentData: object, resumeData: object }
   * Returns: { updatedData: object }
   */
  static async mergeResume(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentData, resumeData } = req.body;

      if (!currentData || typeof currentData !== 'object') {
        return res.status(400).json({
          success: false,
          error: { message: 'currentData (portfolio template data) is required', code: 'BAD_REQUEST' }
        });
      }

      if (!resumeData || typeof resumeData !== 'object') {
        return res.status(400).json({
          success: false,
          error: { message: 'resumeData (parsed resume) is required', code: 'BAD_REQUEST' }
        });
      }

      const updatedData = await AIService.mergeResumeIntoPortfolioData(currentData, resumeData);
      return sendSuccess(res, { updatedData });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * POST /api/ai/generate-assets/:projectId
   */
  static async generateAssets(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const { AssetService } = require('../services/asset.service');
      
      // Fire and forget (it's slow, so we don't wait for completion in the response)
      AssetService.generatePortfolioAssets(projectId);
      
      return sendSuccess(res, { 
        message: 'Asset generation triggered successfully. Images will appear in the background over the next 1-2 minutes.' 
      });
    } catch (error: any) {
      next(error);
    }
  }
}
