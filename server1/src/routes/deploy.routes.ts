import { Router } from 'express';
import { DeployController } from '../controllers/deploy.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router: Router = Router();

router.post('/:projectId', authMiddleware, DeployController.deploy);
router.get('/:deployId/status', authMiddleware, DeployController.getStatus);

export default router;
