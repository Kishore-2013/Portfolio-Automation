import Bull from 'bull';
import path from 'path';
import { execSync } from 'child_process';
import { supabase } from '@/shared/database';
import type { DeployJobPayload } from '@/shared/types';
import { logger } from '@/shared/shared-utils';

const useMock = process.env.NODE_ENV === 'development' && (!process.env.REDIS_URL || process.env.REDIS_URL.startsWith('mock'));
let RedisClass = require('ioredis');

if (useMock) {
  RedisClass = require('ioredis-mock');
  // Bull calls 'client setname', which ioredis-mock doesn't support by default
  if (!RedisClass.prototype.client) {
    RedisClass.prototype.client = () => Promise.resolve('OK');
  }
}

const deployQueue = new Bull<DeployJobPayload>('deploy', {
  createClient: (type) => {
    const opts = {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };
    switch (type) {
      case 'client':
        return new RedisClass(process.env.REDIS_URL || 'redis://localhost:6379', opts);
      case 'subscriber':
        return new RedisClass(process.env.REDIS_URL || 'redis://localhost:6379', opts);
      default:
        return new RedisClass(process.env.REDIS_URL || 'redis://localhost:6379', opts);
    }
  }
});

// Mock function for CDN upload
async function uploadToCDN(distPath: string, projectId: number | string): Promise<string> {
  // In a real app, you'd upload to S3/Firebase/Vercel etc.
  // For now, let's just return a mock URL
  return `https://${projectId}.portfolio-automation.test`;
}

import { DeployService } from '../services/deploy.service';

deployQueue.process(async (job) => {
  const { deployId, projectId, userId } = job.data;
  try {
    // Update status to BUILDING in deployments table
    await supabase
      .from('deployments')
      .update({ status: 'BUILDING' })
      .eq('id', deployId);

    // Run the full deployment pipeline
    const liveUrl = await DeployService.fullDeployment(projectId, userId);

    // Mark as live in deployments table
    await supabase
      .from('deployments')
      .update({
        status: 'LIVE',
        url: liveUrl,
        completed_at: new Date().toISOString()
      })
      .eq('id', deployId);

    logger.info(`Deploy ${deployId} live at ${liveUrl}`, undefined);
  } catch (error) {
    logger.error(`Deployment ${deployId} failed:`, error);
    await supabase
      .from('deployments')
      .update({
        status: 'FAILED',
        error: String(error),
        completed_at: new Date().toISOString()
      })
      .eq('id', deployId);
    throw error;
  }
});

export const deployQueueInstance = deployQueue;

export function startDeployWorker() {
  logger.info('Deploy worker initialized');
}

