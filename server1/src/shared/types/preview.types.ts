/**
 * Preview types — server1-only static serving model.
 * No server2 / runtime pool involved.
 */

export interface PreviewStartResponse {
  /** Always true on success */
  success: true;
  /** Full URL on server1, e.g. http://localhost:3001/preview/42 */
  previewUrl: string;
  /** Which folder is being served: 'dist' | 'src' | 'root' */
  kind: string;
}

export interface PreviewStatus {
  isActive: boolean;
  previewUrl: string | null;
}

// ── Legacy types kept for type-compatibility with other parts of the codebase ──
// These are no longer populated at runtime.

/** @deprecated No longer used — preview is served from server1 */
export interface RuntimeEntry {
  status: 'free' | 'busy';
  port: number;
  projectId: number | null;
  pid: number | null;
  lastActive: number | null;
}

/** @deprecated No longer used — preview is served from server1 */
export interface AssignRuntimeRequest {
  projectId: number | string;
  userId: number | string;
  instancePath: string;
}

/** @deprecated No longer used — preview is served from server1 */
export interface AssignRuntimeResponse {
  previewUrl: string;
  port: number;
  runtimeId: string;
}
