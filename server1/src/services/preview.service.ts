import * as fs from 'fs';
import * as path from 'path';
import { supabase } from '@/shared/database';
import { NotFoundError, ForbiddenError, AppError } from '@/shared/shared-utils';
import {
  getOrSpawnDevServer,
  getRunningPort,
  killDevServer,
  getDevServerStatus,
  DevServerState,
} from './preview-dev.manager';

export class PreviewService {
  /**
   * Start preview:
   *  - If the project has a built dist/ → return a server1 static URL
   *  - Otherwise → spawn (or reuse) a Vite dev server, return its direct URL
   *
   * Returning the Vite URL directly avoids all proxy path-rewriting problems
   * because the browser resolves /@vite/client, /src/*, etc. against the
   * correct origin (the Vite dev server port).
   */
  static async startPreview(
    projectId: number,
    userId: number,
  ): Promise<{ success: true; previewUrl: string; kind: 'dist' | 'dev' }> {
    // 1. Fetch project
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (!project) throw new NotFoundError('Project');
    if (Number(project.user_id) !== userId) throw new ForbiddenError();

    const diskPath: string = project.disk_path || project.local_path || '';

    if (!diskPath) {
      throw new AppError(404, 'Portfolio files not generated', 'PREVIEW_BUILD_NOT_FOUND');
    }
    if (!fs.existsSync(diskPath)) {
      throw new AppError(404, `Project folder not found: ${diskPath}`, 'PREVIEW_BUILD_NOT_FOUND');
    }

    const server1Port = process.env.PORT || 3001;
    const server1Host = process.env.SERVER1_PUBLIC_HOST || `http://localhost:${server1Port}`;

    // 2. Built dist available → serve statically from server1
    const distIndex = path.join(diskPath, 'dist', 'index.html');
    if (fs.existsSync(distIndex)) {
      return {
        success:    true,
        previewUrl: `${server1Host}/preview/${projectId}`,
        kind:       'dist',
      };
    }

    // 3. Source project → spawn dev server, return its direct URL
    const devPort = await getOrSpawnDevServer(String(projectId), diskPath);
    const previewUrl = `http://localhost:${devPort}`;

    return { success: true, previewUrl, kind: 'dev' };
  }

  /**
   * Stop preview — kills the Vite dev server if one is running.
   */
  static async stopPreview(projectId: number, userId: number): Promise<void> {
    const { data: project } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single();

    if (!project) throw new NotFoundError('Project');
    if (Number(project.user_id) !== userId) throw new ForbiddenError();

    killDevServer(String(projectId));
  }

  /**
   * Status — checks if project folder exists and whether Vite is running.
   * Returns an extended `state` field for fine-grained frontend display.
   */
  static async getStatus(
    projectId: string | number,
  ): Promise<{
    isActive:   boolean;
    previewUrl: string | null;
    kind:       'dist' | 'dev' | null;
    state:      DevServerState | 'dist' | null;
  }> {
    const pid = String(projectId);
    if (!pid || pid === 'NaN' || pid === 'null' || pid === 'undefined') {
       return { isActive: false, previewUrl: null, kind: null, state: null };
    }

    const { data: project } = await supabase
      .from('projects')
      .select('disk_path, local_path')
      .eq('id', pid)
      .single();

    const diskPath: string = project?.disk_path || project?.local_path || '';
    const folderExists = !!diskPath && fs.existsSync(diskPath);

    if (!folderExists) return { isActive: false, previewUrl: null, kind: null, state: null };

    const server1Port = process.env.PORT || 3001;
    const server1Host = process.env.SERVER1_PUBLIC_HOST || `http://localhost:${server1Port}`;

    // dist build available?
    const distIndex = path.join(diskPath, 'dist', 'index.html');
    if (fs.existsSync(distIndex)) {
      return {
        isActive:   true,
        previewUrl: `${server1Host}/preview/${projectId}`,
        kind:       'dist',
        state:      'dist',
      };
    }

    // Vite running?
    const port = getRunningPort(pid);
    if (port) {
      return {
        isActive:   true,
        previewUrl: `http://localhost:${port}`,
        kind:       'dev',
        state:      'running',
      };
    }

    // Check if it's still starting or crashed
    const { state } = getDevServerStatus(pid);

    // Folder exists but preview not started yet
    return { isActive: false, previewUrl: null, kind: null, state: state === 'idle' ? null : state };
  }

  /**
   * Health-check — TCP probes the dev server port for a project.
   * Used by the frontend heartbeat to detect silent crashes without
   * waiting for the full status poll cycle.
   */
  static async healthCheck(
    projectId: string | number,
  ): Promise<{ alive: boolean; port: number | null; state: DevServerState | null }> {
    const pid = String(projectId);
    const { state, port } = getDevServerStatus(pid);

    if (!port) return { alive: false, port: null, state: state as DevServerState | null };

    const alive = await new Promise<boolean>(resolve => {
      const { createConnection } = require('net') as typeof import('net');
      const sock = createConnection({ port, host: '127.0.0.1' });
      const timer = setTimeout(() => { sock.destroy(); resolve(false); }, 2000);
      sock.once('connect', () => { clearTimeout(timer); sock.destroy(); resolve(true); });
      sock.once('error',   () => { clearTimeout(timer); resolve(false); });
    });

    return { alive, port, state: state as DevServerState };
  }
}
