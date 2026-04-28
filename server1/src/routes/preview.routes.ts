import { Router, Request, Response, NextFunction } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { PreviewController } from '../controllers/preview.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { supabase } from '@/shared/database';
import {
  getOrSpawnDevServer,
  getRunningPort,
} from '../services/preview-dev.manager';

const router: Router = Router();

// ── Authenticated API endpoints ───────────────────────────────────────────────
router.post('/:projectId/start',   authMiddleware, PreviewController.start);
router.post('/:projectId/stop',    authMiddleware, PreviewController.stop);
router.get( '/:projectId/status',  authMiddleware, PreviewController.getStatus);
router.get( '/:projectId/health',  authMiddleware, PreviewController.healthCheck);

// ── Preview page (no auth – iframe loads this) ────────────────────────────────
//
// Strategy:
//   dist/index.html exists  → serve static build (rewrite asset paths)
//   no dist                 → redirect browser directly to the Vite dev server
//
// Why redirect instead of proxy?
//   Vite injects root-relative HMR paths (/@vite/client, /@react-refresh, /src/…)
//   into the HTML it serves.  If we proxy through /preview/:id, the browser
//   requests those from localhost:3001 which has no idea what they are.
//   A plain 302 redirect to the Vite port lets the browser resolve everything
//   against the correct origin without any path rewriting.
//
router.get('/:projectId', previewEntry);

async function previewEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;

    // ── Fetch project from DB ─────────────────────────────────────────────────
    const { data: project } = await supabase
      .from('projects')
      .select('disk_path, local_path')
      .eq('id', projectId)
      .single();

    if (!project) {
      return res.status(404).json({ code: 'PREVIEW_NOT_FOUND', message: 'Project not found' });
    }

    const diskPath: string = project.disk_path || project.local_path || '';

    if (!diskPath) {
      return res.status(404).json({ code: 'PREVIEW_BUILD_NOT_FOUND', message: 'Portfolio files not generated' });
    }

    if (!fs.existsSync(diskPath)) {
      return res.status(404).json({
        code:    'PREVIEW_BUILD_NOT_FOUND',
        message: `Project folder missing: ${diskPath}`,
      });
    }

    // ── Inject/Sync portfolio data & assets ──────────────────────────────────
    // We do this EVERY time to ensure the preview has the latest DB data.
    try {
      const { injectPortfolioData } = await import('../services/portfolio-data-injector');
      const { AssetService } = await import('../services/asset.service');

      await injectPortfolioData(projectId, diskPath);

      // Trigger asset generation in background (don't await)
      AssetService.generatePortfolioAssets(Number(projectId));

    } catch (err: any) {
      console.warn(`[PREVIEW] Data injection/asset generation failed for ${projectId}:`, err.message);
    }

    // ── Strategy 1: serve built dist/ ────────────────────────────────────────
    const distIndex = path.join(diskPath, 'dist', 'index.html');
    if (fs.existsSync(distIndex)) {
      console.log(`[PREVIEW] Serving dist build for project ${projectId}`);
      const html = fs.readFileSync(distIndex, 'utf-8');
      return res
        .setHeader('Content-Type', 'text/html')
        .send(rewriteDistHtml(html, projectId));
    }

    // ── Strategy 2: redirect to Vite dev server ───────────────────────────────
    // Look up already-running port first (no wait), else spawn.
    let port = getRunningPort(projectId);
    if (!port) {
      console.log(`[PREVIEW] Starting Vite dev server for project ${projectId}...`);
      try {
        port = await getOrSpawnDevServer(projectId, diskPath);
      } catch (err: any) {
        console.error(`[PREVIEW] Failed to start Vite for project ${projectId}:`, err.message);
        return res.status(503).json({
          code:    'PREVIEW_DEV_UNAVAILABLE',
          message: err.message || 'Could not start portfolio preview',
        });
      }
    }

    // 302 redirect → browser loads Vite directly; HMR, @vite/client, /src/* all resolve correctly
    const viteUrl = `http://localhost:${port}`;
    console.log(`[PREVIEW] Redirecting project ${projectId} → ${viteUrl}`);
    return res.redirect(302, viteUrl);

  } catch (err) {
    next(err);
  }
}

// ── Serve dist/ sub-assets (js, css, images …) ───────────────────────────────
//
// After the browser loads the rewritten index.html (with paths like
// /preview/:id/assets/…) it requests those sub-files here.
//
router.get('/:projectId/*', serveDistAsset);

async function serveDistAsset(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const subPath = (req.params as any)[0] as string;   // everything after /:projectId/

    const { data: project } = await supabase
      .from('projects')
      .select('disk_path, local_path')
      .eq('id', projectId)
      .single();

    const diskPath: string = project?.disk_path || project?.local_path || '';
    if (!diskPath) return next();

    const distDir = path.join(diskPath, 'dist');
    if (!fs.existsSync(distDir)) return next();

    const filePath = path.join(distDir, subPath.replace(/\.\./g, ''));
    if (!fs.existsSync(filePath)) return next();

    return res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
}

// ── dist HTML rewriter ────────────────────────────────────────────────────────
//
// Vite builds produce root-absolute paths (/assets/…).
// When served under /preview/:id/, the browser resolves these against root
// and gets 404.  We rewrite them to /preview/:id/assets/… so our
// serveDistAsset handler above picks them up.
//
function rewriteDistHtml(html: string, projectId: string): string {
  const base = `/preview/${projectId}/`;
  return html
    .replace(/(<script[^>]+\bsrc=")\//g,    `$1${base}`)
    .replace(/(<link[^>]+\bhref=")\//g,     `$1${base}`)
    .replace(/url\(\//g,                    `url(${base}`)
    .replace(/<head>/i, `<head>\n  <base href="${base}">`);
}

export default router;
