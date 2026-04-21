export interface DeployJobPayload {
  deployId: number;
  projectId: number;
  userId: number;
  diskPath: string;
}

export interface DeploymentDTO {
  id: number;
  projectId: number;
  status: 'QUEUED' | 'BUILDING' | 'LIVE' | 'FAILED';
  url: string | null;
  error: string | null;
  createdAt: Date;
  completedAt: Date | null;
}
