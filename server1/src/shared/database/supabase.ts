import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY/SUPABASE_SERVICE_ROLE_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- Table Types (Matching Prisma schema for compatibility) ---

export type ProjectStatus = 'CREATING' | 'READY' | 'SLEEPING' | 'ERROR';
export type SnapshotType = 'AUTO' | 'MANUAL' | 'PREDEPLOY' | 'PRERESTORE';
export type DeploymentStatus = 'QUEUED' | 'BUILDING' | 'LIVE' | 'FAILED';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  workspace_path?: string;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  tech_stack: string[];
  domain: string;
  git_repo_url: string;
  thumb_url?: string;
  previews: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  user_id: number;
  template_id: string;
  name: string;
  repo_name?: string;
  repo_url?: string;
  live_url?: string;
  local_path?: string;
  disk_path: string;
  status: ProjectStatus;
  preview_url?: string;
  last_saved_at?: string;
  last_opened_at?: string;
  last_updated?: string;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: number;
  user_id: number;
  parsed_json: any;
  raw_path?: string;
  created_at: string;
}

export interface Deployment {
  id: number;
  project_id: number;
  user_id: number;
  status: DeploymentStatus;
  url?: string;
  error?: string;
  created_at: string;
  completed_at?: string;
}

export interface ProjectSnapshot {
  id: number;
  project_id: number;
  type: SnapshotType;
  label?: string;
  files_json: any;
  file_count: number;
  size_bytes: number;
  created_at: string;
}

export interface ProjectActivity {
  id: number;
  project_id: number;
  user_id: number;
  message: string;
  created_at: string;
}
