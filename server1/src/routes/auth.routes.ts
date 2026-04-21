import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { registerSchema, loginSchema } from '@/shared/validation';

import { UserController } from '../controllers/user.controller';

const router: Router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/logout', authMiddleware, AuthController.logout);
router.post('/refresh', AuthController.refresh);
router.get('/me', authMiddleware, UserController.getProfile);

export default router;
