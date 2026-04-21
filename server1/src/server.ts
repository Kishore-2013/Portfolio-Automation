import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { parseEnv, server1EnvSchema } from '@/shared/config';
import authRoutes from './routes/auth.routes';
import { projectRoutes } from './routes/project.routes';
import resumeRoutes from './routes/resume.routes';
import deployRoutes from './routes/deploy.routes';
import previewRoutes from './routes/preview.routes';
import { adminRoutes } from './routes/admin.routes';
import userRoutes from './routes/user.routes';
import aiRoutes from './routes/ai.routes';

import { errorHandler } from './middleware/errorHandler.middleware';
import { RedisService } from './services/redis.service';
import { startDeployWorker } from './jobs/deploy.worker';
import { startDiskCleanupWorker } from './jobs/cleanup.worker';

// Now import database after env is loaded via 'dotenv/config'
import { supabase } from '@/shared/database';

// Parse and validate environment variables
const env = parseEnv(server1EnvSchema);

// Initialize background services
// RedisService now initializes on import
startDeployWorker();
startDiskCleanupWorker();

const app = express();


// Middleware
app.use(cors({
  origin: true, // In production, replace with specific origins
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/deploy', deployRoutes);
app.use('/api/preview', previewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// ── Static portfolio preview (no server2) ────────────────────────────────────
// GET /preview/:projectId  →  serves the built portfolio files from disk
// This reuses previewRoutes which already handles static serving internally.
app.use('/preview', previewRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'server1'
  });
});

// Database test route
app.get('/users', async (req, res) => {
  try {
    const { data: users } = await supabase.from('users').select('*');
    res.json({ success: true, count: users?.length || 0, users });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// Error handling
app.use(errorHandler);

const PORT = env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server 1 is running on port ${PORT}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
});
