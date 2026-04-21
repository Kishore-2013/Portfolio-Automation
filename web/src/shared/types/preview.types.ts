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
  isActive: boolean;
  port: number | null;
  previewUrl: string | null;
}

