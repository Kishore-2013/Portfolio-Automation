/**
 * Preview types — server1-only static serving model.
 * Preview is served directly from server1 via:
 *   - express.static on built dist/ folders, OR
 *   - redirect to a per-project Vite dev server (preview-dev.manager.ts)
 *
 * No server2, no runtime pool, no port 3002.
 */

export type DevServerState = 'starting' | 'running' | 'crashed' | 'idle';

export interface PreviewStartResponse {
  /** Always true on success */
  success: true;
  /** Full URL on server1, e.g. http://localhost:3001/preview/42 */
  previewUrl: string;
  /** 'dist' when serving a built bundle; 'dev' when using Vite dev server */
  kind: 'dist' | 'dev';
}

export interface PreviewStatusResponse {
  isActive:   boolean;
  previewUrl: string | null;
  kind:       'dist' | 'dev' | null;
  /** Fine-grained server state for frontend display */
  state:      DevServerState | 'dist' | null;
}

export interface PreviewHealthResponse {
  alive: boolean;
  port:  number | null;
  state: DevServerState | null;
}
