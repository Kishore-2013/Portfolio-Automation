import { Router } from 'express';
import { templateUpload } from '../middleware/upload.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { TemplateController } from '../controllers/template.controller';

const router: Router = Router();

router.use(adminMiddleware);

router.post('/verify', (req, res) => {
  res.json({ success: true, message: 'Authentication confirmed.' });
});

router.post(
  '/templates/upload',
  templateUpload,
  TemplateController.upload
);

router.delete(
  '/templates/:id',
  TemplateController.remove
);

export { router as adminRoutes };
