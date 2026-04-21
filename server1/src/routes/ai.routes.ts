import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router: Router = Router();

// POST /api/ai/merge-resume — merge parsed resume into template portfolioData
router.post('/merge-resume', authMiddleware, AIController.mergeResume);

// POST /api/ai/generate-assets/:projectId
router.post('/generate-assets/:projectId', authMiddleware, AIController.generateAssets);

export default router;
