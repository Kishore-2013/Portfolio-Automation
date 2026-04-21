import * as fs from 'fs';
import * as path from 'path';
import { supabase } from '@/shared/database';
import { logger } from '@/shared/shared-utils';

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const CLEANUP_INTERVAL = 60 * 60 * 1000; // Check every hour

export function startDiskCleanupWorker() {
  setInterval(async () => {
    try {
      logger.info('Running routine disk clearance for inactive projects...', undefined, 'disk-cleanup');

      const cutoffTime = new Date(Date.now() - TWENTY_FOUR_HOURS).toISOString();

      // Find projects where last_saved_at and last_opened_at are older than 24h
      // Supabase/PostgREST: use .or() for complex queries
      const { data: idleProjects, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .or(`last_saved_at.lt.${cutoffTime},last_saved_at.is.null`)
        .or(`last_opened_at.lt.${cutoffTime},last_opened_at.is.null`);

      if (fetchError || !idleProjects) {
          logger.error('Failed to fetch idle projects for cleanup', fetchError, 'disk-cleanup');
          return;
      }

      let removedCount = 0;

      for (const project of idleProjects) {
        if (project.disk_path && fs.existsSync(project.disk_path)) {
          // Check if it's really older than 24 hours from BOTH last saved and last opened
          const savedAt = project.last_saved_at ? new Date(project.last_saved_at).getTime() : 0;
          const openedAt = project.last_opened_at ? new Date(project.last_opened_at).getTime() : 0;
          const latestActivity = Math.max(savedAt, openedAt);

          if (Date.now() - latestActivity > TWENTY_FOUR_HOURS) {
            try {
              // Physically wipe the directory to save space
              fs.rmSync(project.disk_path, { recursive: true, force: true });
              removedCount++;
              
              // We also mark it as SLEEPING in the database to indicate it was hibernated
              await supabase
                .from('projects')
                .update({ status: 'SLEEPING' })
                .eq('id', project.id);
              
            } catch (err) {
              logger.error(`Failed to wipe disk path ${project.disk_path} for project ${project.id}`, err, 'disk-cleanup');
            }
          }
        }
      }

      if (removedCount > 0) {
        logger.info(`Cleaned up ${removedCount} inactive project directories to free up disk space.`, undefined, 'disk-cleanup');
      }

    } catch (err) {
      logger.error('Error during routine disk cleanup task', err, 'disk-cleanup');
    }
  }, CLEANUP_INTERVAL);
  
  logger.info('Disk cleanup worker started - will hibernate projects inactive for >24h', undefined, 'disk-cleanup');
}

