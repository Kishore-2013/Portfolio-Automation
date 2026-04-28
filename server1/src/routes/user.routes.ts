import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router: Router = Router();

router.put('/workspace', authMiddleware, UserController.updateWorkspace);
router.get('/profile', authMiddleware, UserController.getProfile);

export default router;
