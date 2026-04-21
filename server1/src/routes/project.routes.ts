import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router: Router = Router();

// All project routes require a valid JWT
router.use(authMiddleware);

// 1. List templates (cached in Redis)
router.get('/templates', ProjectController.listTemplates);

// 2. List user's own projects (dashboard)
router.get('/', ProjectController.listProjects);

// 3. Create a new project instance from a template
router.post('/create', ProjectController.create);

// 4. Get the file tree for the IDE sidebar
router.get('/:id/files', ProjectController.getFileTree);

// 5. Get single file content for Monaco editor
//    The wildcard captures any depth: src/App.jsx, src/components/Hero.jsx, etc.
router.get('/:id/files/*', ProjectController.getFile);

// 5.5 Get full VFS (Redis cached) - used for fast reload/persistence
router.get('/:id/full-vfs', ProjectController.getFullVFS);

// 6. Save file content from Monaco editor
router.put('/:id/files/*', ProjectController.saveFile);

// 7. Snapshots
router.get('/:id/snapshots', ProjectController.listSnapshots);
router.post('/:id/snapshots', ProjectController.createManualSnapshot);
router.post('/:id/snapshots/:snapshotId/restore', ProjectController.restore);

// 8. Delete project and system status
router.get('/:id/disk-path', ProjectController.getDiskPath);
router.delete('/:id', ProjectController.delete);
router.get('/health/storage', ProjectController.getStorageStatus);

export { router as projectRoutes };
