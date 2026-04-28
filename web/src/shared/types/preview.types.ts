export type DevServerState = 'starting' | 'running' | 'crashed' | 'idle';

export interface RuntimeEntry {
  status: 'free' | 'busy';
  port: number;
  projectId: number | null;
  pid: number | null;
  lastActive: number | null;
}

export interface AssignRuntimeRequest {
  projectId: number | string;
  userId: number | string;
  instancePath: string;
}

export interface AssignRuntimeResponse {
  previewUrl: string;
  port: number;
  runtimeId: string;
}

export interface PreviewStatus {
  isActive:   boolean;
  previewUrl: string | null;
  kind:       'dist' | 'dev' | null;
  /** Fine-grained server state for frontend display */
  state:      DevServerState | 'dist' | null;
}

export interface PreviewHealth {
  alive: boolean;
  port:  number | null;
  state: DevServerState | null;
}
