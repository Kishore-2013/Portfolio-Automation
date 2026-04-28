import { supabase } from '@/shared/database';
import { NotFoundError, AppError } from '@/shared/shared-utils';
import * as fs from 'fs';
import * as path from 'path';

export class UserService {
  static async updateWorkspace(userId: number, workspacePath: string) {
    // 1. Validate if path is absolute and exists (or is creatable)
    if (!path.isAbsolute(workspacePath)) {
      throw new AppError(400, 'Workspace path must be absolute', 'INVALID_PATH');
    }

    // 2. Test if the disk is writable
    try {
      if (!fs.existsSync(workspacePath)) {
        fs.mkdirSync(workspacePath, { recursive: true });
      }
      
      const testFile = path.join(workspacePath, `.write-test-${Date.now()}`);
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
    } catch (err: any) {
      throw new AppError(400, `Cannot write to disk at "${workspacePath}": ${err.message}`, 'DISK_PERMISSION_DENIED');
    }

    // 3. Update in DB
    const { data: user, error } = await supabase
      .from('users')
      .update({ workspace_path: workspacePath })
      .eq('id', userId)
      .select('id, email, name, workspace_path')
      .single();

    if (error || !user) {
        throw new AppError(500, 'Could not update workspace path: ' + error?.message);
    }

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        workspacePath: user.workspace_path
    };
  }

  static async getProfile(userId: number) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, workspace_path')
      .eq('id', userId)
      .single();

    if (error || !user) throw new NotFoundError('User');
    
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        workspacePath: user.workspace_path
    };
  }
}
