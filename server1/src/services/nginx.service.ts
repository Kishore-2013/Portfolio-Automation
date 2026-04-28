import * as fs from 'fs';
import { execSync } from 'child_process';
import { logger } from '@/shared/shared-utils';

const NGINX_CONF = process.env.NGINX_CONF_PATH || '/etc/nginx/conf.d/previews.conf';

// In-memory map to track active routes
const activeRoutes = new Map<string, number>(); // projectId → port

export class NginxService {
  static async addPreviewRoute(projectId: string, port: number): Promise<void> {
    activeRoutes.set(projectId, port);
    this.rewrite();
  }

  static async removePreviewRoute(projectId: string): Promise<void> {
    activeRoutes.delete(projectId);
    this.rewrite();
  }

  private static rewrite(): void {
    try {
      const blocks = Array.from(activeRoutes.entries()).map(
        ([id, port]) => `
location /preview/${id}/ {
    proxy_pass http://127.0.0.1:${port}/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}`
      );
      
      // Ensure directory exists if not in windows (assuming linux for nginx)
      // On Windows development, we might just want to log
      if (process.platform !== 'win32') {
        fs.writeFileSync(NGINX_CONF, blocks.join('\n'));
        execSync('nginx -s reload');
      } else {
        logger.info(`[Nginx Mock] Writing config to ${NGINX_CONF} for ${activeRoutes.size} routes`);
      }
    } catch (error) {
      logger.error('Nginx rewrite failed:', error);
    }
  }
}
