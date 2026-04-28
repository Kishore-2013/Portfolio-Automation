import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess } from '@/shared/shared-utils';

export class UserController {
  static async updateWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: number = Number((req as any).user.userId);
      const { workspacePath } = req.body;
      const user = await UserService.updateWorkspace(userId, workspacePath);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: number = Number((req as any).user.userId);
      const user = await UserService.getProfile(userId);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  }
}
