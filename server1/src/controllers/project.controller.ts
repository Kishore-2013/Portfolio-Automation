import { Request, Response, NextFunction } from 'express';
import {
  getTemplates,
  createProjectInstance,
  getFileTree,
  getFileContent,
  saveFileContent,
  getFullVfsCached,
  listUserProjects,
  listSnapshots,
  restoreSnapshot,
  createSnapshot,
  deleteProject,
  getDiskStatus,
} from '../services/project.service';
import { supabase } from '@/shared/database';
import { sendSuccess, NotFoundError, ValidationError } from '@/shared/shared-utils';
import { createProjectSchema, saveFileSchema, createSnapshotSchema } from '@/shared/validation';

export class ProjectController {

  // GET /api/projects/templates
  static listTemplates = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templates = await getTemplates();
      sendSuccess(res, templates);
    } catch (err) { next(err); }
  };

  // POST /api/projects/create
  static create = async (req: Request, res: Response, next: NextFunction) => {
    console.log(`[PROJECT_CREATE] 🚀 Received request from User: ${req.user?.userId}`);
    console.log(`[PROJECT_CREATE] Payload:`, JSON.stringify(req.body, null, 2));

    try {
      const parsed = createProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        console.warn(`[PROJECT_CREATE] ❌ Validation failed:`, parsed.error.format());
        return next(new ValidationError(parsed.error.flatten().fieldErrors));
      }

      const { templateId, name } = parsed.data;
      const userId = Number(req.user!.userId); // Cast to number for Int-based ID

      console.log(`[PROJECT_CREATE] 🛠️ Starting creation flow for template: ${templateId}, name: ${name}`);
      const project = await createProjectInstance(userId, templateId!, name!);
      
      console.log(`[PROJECT_CREATE] ✅ Successfully created project: ${project.id}`);
      sendSuccess(res, project, 201);
    } catch (err: any) {
      console.error(`[PROJECT_CREATE] 💥 CRITICAL FAILURE:`, err.message);
      if (err.stack) console.error(err.stack);
      next(err);
    }
  };


  // GET /api/projects/:id/files
  static getFileTree = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) return next(new ValidationError({ id: ['Invalid project ID'] }));

      const result = await getFileTree(projectId, Number(req.user!.userId));
      sendSuccess(res, result);
    } catch (err) { next(err); }
  };

  // GET /api/projects/:id/files/*
  static getFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) return next(new ValidationError({ id: ['Invalid project ID'] }));

      // Express wildcard puts the matched path in req.params[0]
      // e.g. /api/projects/101/files/src/App.jsx → req.params[0] = "src/App.jsx"
      const filePath = req.params[0];
      if (!filePath) return next(new ValidationError({ path: ['File path required'] }));

      const result = await getFileContent(projectId, Number(req.user!.userId), filePath);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  };

  // PUT /api/projects/:id/files/*
  static saveFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) return next(new ValidationError({ id: ['Invalid project ID'] }));

      const filePath = req.params[0];
      if (!filePath) return next(new ValidationError({ path: ['File path required'] }));

      const parsed = saveFileSchema.safeParse(req.body);
      if (!parsed.success) return next(new ValidationError(parsed.error.flatten().fieldErrors));

      const result = await saveFileContent(projectId, Number(req.user!.userId), filePath, parsed.data.content);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  };

  // GET /api/projects/:id/full-vfs
  static getFullVFS = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) return next(new ValidationError({ id: ['Invalid project ID'] }));

      const result = await getFullVfsCached(projectId, Number(req.user!.userId));
      sendSuccess(res, result);
    } catch (err) { next(err); }
  };

  // GET /api/projects
  static listProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await listUserProjects(Number(req.user!.userId));
      sendSuccess(res, projects);
    } catch (err) { next(err); }
  };

  // GET /api/projects/:id/snapshots
  static listSnapshots = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) return next(new ValidationError({ id: ['Invalid project ID'] }));

      const result = await listSnapshots(projectId, Number(req.user!.userId));
      sendSuccess(res, result);
    } catch (err) { next(err); }
  };

  // POST /api/projects/:id/snapshots
  static createManualSnapshot = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) return next(new ValidationError({ id: ['Invalid project ID'] }));

      const parsed = createSnapshotSchema.safeParse(req.body);
      if (!parsed.success) return next(new ValidationError(parsed.error.flatten().fieldErrors));

      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', Number(req.user!.userId))
        .single();

      if (!project) throw new NotFoundError('Project');

      await createSnapshot(projectId, project.disk_path, 'MANUAL', parsed.data.label ?? null);
      sendSuccess(res, { created: true }, 201);
    } catch (err) { next(err); }
  };

  // POST /api/projects/:id/snapshots/:snapshotId/restore
  static restore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = parseInt(req.params.id);
      const snapshotId = parseInt(req.params.snapshotId);
      if (isNaN(projectId) || isNaN(snapshotId)) {
        return next(new ValidationError({ id: ['Invalid ID'] }));
      }

      const result = await restoreSnapshot(projectId, Number(req.user!.userId), snapshotId);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  };

  // DELETE /api/projects/:id
  static delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) return next(new ValidationError({ id: ['Invalid project ID'] }));

      await deleteProject(projectId, Number(req.user!.userId));
      sendSuccess(res, { deleted: true });
    } catch (err) { next(err); }
  };

  // GET /api/projects/:id/disk-path
  static getDiskPath = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) return next(new ValidationError({ id: ['Invalid project ID'] }));

      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', Number(req.user!.userId))
        .single();

      if (!project) throw new NotFoundError('Project');
      sendSuccess(res, { diskPath: project.disk_path });
    } catch (err) { next(err); }
  };

  // GET /api/projects/storage-status
  static getStorageStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = await getDiskStatus();
      sendSuccess(res, status);
    } catch (err) { next(err); }
  };
}
