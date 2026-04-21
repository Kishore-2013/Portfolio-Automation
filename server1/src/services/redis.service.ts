import Redis from 'ioredis';
import { logger } from '@/shared/shared-utils';

const useMock = process.env.NODE_ENV === 'development' && (!process.env.REDIS_URL || process.env.REDIS_URL.startsWith('mock'));
const RedisClass = useMock ? require('ioredis-mock') : Redis;
const redis = new RedisClass(process.env.REDIS_URL || 'redis://localhost:6379');

export class RedisService {
  // ── Auth & Rate Limiting (Existing) ──────────────────────────────────────────

  static async isTokenBlacklisted(jti: string): Promise<boolean> {
    try {
      const result = await redis.get(`blacklist:jti:${jti}`);
      return !!result;
    } catch (error) {
      return false;
    }
  }

  static async blacklistToken(jti: string, expirySeconds: number): Promise<void> {
    try {
      await redis.set(`blacklist:jti:${jti}`, '1', 'EX', expirySeconds);
    } catch (error) {
      logger.warn('Failed to blacklist token in Redis');
    }
  }

  static async incrementLoginFail(ip: string): Promise<void> {
    try {
      const key = `loginfail:${ip}`;
      await redis.multi()
        .incr(key)
        .expire(key, 900)
        .exec();
    } catch (error) {
      // Ignore
    }
  }

  static async getLoginFailCount(ip: string): Promise<number> {
    try {
      const count = await redis.get(`loginfail:${ip}`);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      return 0; // Assume 0 if Redis is down
    }
  }

  // ── Template cache ──────────────────────────────────────────────────────────
  // Templates never change at runtime so cache them for 10 minutes.
  // This means 500 users opening the gallery simultaneously
  // all get served from Redis — zero DB hits after the first request.

  static async getCachedTemplates(): Promise<string | null> {
    try {
      return await redis.get('templates:list');
    } catch (error) {
      return null;
    }
  }

  static async setCachedTemplates(json: string): Promise<void> {
    try {
      await redis.set('templates:list', json, 'EX', 600); // 10 minutes
    } catch (error) {
      logger.warn('Failed to cache templates in Redis');
    }
  }

  static async invalidateTemplateCache(): Promise<void> {
    try {
      await redis.del('templates:list');
    } catch (error) {
      logger.warn('Failed to invalidate template cache');
    }
  }

  // ── Preview activity tracking ────────────────────────────────────────────────
  // Written on every file save. Server 2's cleanup service reads this
  // to determine if a project is idle and should release its runtime.

  // ── Preview activities ───────────────────────────────────────────────────────

  static async touchProjectActivity(projectId: number): Promise<void> {
    try {
      await redis.set(
        `preview:${projectId}:active`,
        Date.now().toString(),
        'EX',
        3600
      );
    } catch (error) {}
  }

  static async touchRuntime(projectId: string | number): Promise<void> {
    return this.touchProjectActivity(Number(projectId));
  }

  static async getPreviewPort(projectId: string | number): Promise<number | null> {
    try {
      const port = await redis.get(`preview:${projectId}:port`);
      return port ? parseInt(port, 10) : null;
    } catch (error) {
      return null;
    }
  }

  static async setPreviewPort(projectId: string | number, port: number): Promise<void> {
    try {
      await redis.set(`preview:${projectId}:port`, port.toString(), 'EX', 3600);
    } catch (error) {}
  }

  static async clearPreview(projectId: string | number): Promise<void> {
    try {
      await redis.del(`preview:${projectId}:port`);
    } catch (error) {}
  }

  static async getLastActivity(projectId: number): Promise<number | null> {
    try {
      const val = await redis.get(`preview:${projectId}:active`);
      return val ? parseInt(val, 10) : null;
    } catch (error) {
      return null;
    }
  }

  // ── Project File Cache ───────────────────────────────────────────────────────
  // Caches the entire project files structure for fast resume/refresh
  
  static async getCachedFiles(projectId: number): Promise<string | null> {
    try {
      return await redis.get(`project:${projectId}:vfs`);
    } catch (error) {
      return null;
    }
  }

  static async setCachedFiles(projectId: number, json: string): Promise<void> {
    try {
      // Cache VFS for 1 hour of activity
      await redis.set(`project:${projectId}:vfs`, json, 'EX', 3600);
    } catch (error) {
      logger.warn(`Failed to cache project ${projectId} files in Redis`);
    }
  }

  static async invalidateFileCache(projectId: number): Promise<void> {
    try {
      await redis.del(`project:${projectId}:vfs`);
    } catch (error) {}
  }
}

