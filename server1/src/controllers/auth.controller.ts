import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, UnauthorizedError } from '@/shared/shared-utils';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, tokens } = await AuthService.register(req.body);

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return sendSuccess(
        res,
        {
          user,
          tokens: {
            accessToken: tokens.accessToken,
          },
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const { user, tokens } = await AuthService.login(req.body, ip);

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return sendSuccess(res, {
        user,
        tokens: {
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { jti, exp } = req.user!;
      
      await AuthService.logout(jti, exp);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      return sendSuccess(res, { message: 'Logged out' });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token missing');
      }

      const { accessToken } = await AuthService.refresh(refreshToken);

      return sendSuccess(res, { accessToken });
    } catch (error) {
      next(error);
    }
  }
}
