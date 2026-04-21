import * as fs from 'fs';
import * as path from 'path';
import { supabase } from '@/shared/database';
import { NotFoundError, ForbiddenError, AppError } from '@/shared/shared-utils';
import {
  getOrSpawnDevServer,
  getRunningPort,
  killDevServer,
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
  ): Promise<{ success: true; previewUrl: string; kind: 'dist' | 'vite' }> {
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

    // 3. Source project → spawn Vite dev server, return its direct URL
    const vitePort = await getOrSpawnDevServer(String(projectId), diskPath);
    const previewUrl = `http://localhost:${vitePort}`;

    return { success: true, previewUrl, kind: 'vite' };
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
   */
  static async getStatus(
    projectId: string | number,
  ): Promise<{ isActive: boolean; previewUrl: string | null; kind: 'dist' | 'vite' | null }> {
    const { data: project } = await supabase
      .from('projects')
      .select('disk_path, local_path')
      .eq('id', projectId)
      .single();

    const diskPath: string = project?.disk_path || project?.local_path || '';
    const folderExists = !!diskPath && fs.existsSync(diskPath);

    if (!folderExists) return { isActive: false, previewUrl: null, kind: null };

    const server1Port = process.env.PORT || 3001;
    const server1Host = process.env.SERVER1_PUBLIC_HOST || `http://localhost:${server1Port}`;

    // dist build available?
    const distIndex = path.join(diskPath, 'dist', 'index.html');
    if (fs.existsSync(distIndex)) {
      return {
        isActive:   true,
        previewUrl: `${server1Host}/preview/${projectId}`,
        kind:       'dist',
      };
    }

    // Vite running?
    const port = getRunningPort(String(projectId));
    if (port) {
      return { isActive: true, previewUrl: `http://localhost:${port}`, kind: 'vite' };
    }

    // Folder exists but preview not started yet
    return { isActive: false, previewUrl: null, kind: null };
  }
}
