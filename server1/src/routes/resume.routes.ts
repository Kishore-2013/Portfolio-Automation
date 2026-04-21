import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import { ResumeController } from '../controllers/resume.controller';
import { authMiddleware } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Multer config
// Files are saved to OS temp dir as resume-{userId}-{timestamp}.pdf
// The service deletes the file after parsing.
// ─────────────────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, _file, cb) => {
    const userId = (req.user as any)?.userId ?? 'unknown';
    cb(null, `resume-${userId}-${Date.now()}.pdf`);
  }
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  }
});

const router: Router = Router();

// POST /api/resume/parse — upload + parse and save
router.post('/parse', authMiddleware, upload.single('file'), ResumeController.parse);

// POST /api/resume/upload — legacy alias for parse
router.post('/upload', authMiddleware, upload.single('file'), ResumeController.upload);

// POST /api/resume/apply/:projectId — apply resume data to project
router.post('/apply/:projectId', authMiddleware, ResumeController.apply);

// GET /api/resume/latest — fetch latest parsed resume data
router.get('/latest', authMiddleware, ResumeController.getLatest);

export default router;
