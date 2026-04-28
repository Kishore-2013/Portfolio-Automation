import { Request, Response, NextFunction } from 'express';
import { ResumeService } from '../services/resume.service';
import { sendSuccess, UnauthorizedError } from '@/shared/shared-utils';
import { supabase } from '@/shared/database';

interface AuthRequest extends Request {
  user?: any;
  file?: any;
}

export class ResumeController {

  /**
   * POST /api/resume/parse
   * Accepts a multipart upload, parses the PDF, saves to DB, and returns the structured data.
   */
  static async parse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { message: 'No file uploaded', code: 'BAD_REQUEST' }
        });
      }

      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError('User ID not found in token');
      }

      const parsed = await ResumeService.parseOnly(req.file.path, Number(userId));
      const resume = await ResumeService.saveParsedData(userId, parsed);

      return sendSuccess(res, { resumeId: resume.id, parsed });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * POST /api/resume/upload
   * Legacy alias for parse: Accept a PDF resume upload, parse it, store in DB, and return.
   */
  static async upload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { message: 'No file uploaded', code: 'BAD_REQUEST' }
        });
      }

      const { userId } = req.user!;
      const filePath = req.file.path;

      const parsed = await ResumeService.parseOnly(filePath, Number(userId));
      const resume = await ResumeService.saveParsedData(userId, parsed);

      return sendSuccess(res, { resumeId: resume.id, parsed });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/resume/apply/:projectId
   * Body: { resumeId: number }
   */
  static async apply(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const userId = Number(req.user!.userId);
      const { resumeId } = req.body;

      if (!resumeId) {
        return res.status(400).json({
          success: false,
          error: { message: 'resumeId is required', code: 'BAD_REQUEST' }
        });
      }

      await ResumeService.applyToProject(userId, Number(resumeId), projectId);

      return sendSuccess(res, { applied: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/resume/latest
   * Fetches the user's most recent parsed resume.
   */
  static async getLatest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.user!.userId);
      const resume = await ResumeService.getLatestResume(userId);
      
      if (!resume) {
        return sendSuccess(res, { resume: null });
      }

      return sendSuccess(res, { resume: resume.parsed_json });
    } catch (error) {
      next(error);
    }
  }
}
