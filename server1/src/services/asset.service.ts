import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { AIService } from './ai.service';
import { supabase } from '@/shared/database';
import { logger } from '@/shared/shared-utils';
import { normalizePortfolioData } from './portfolio-data-injector';
import { IPortfolioData, ParsedProject } from '@/shared/types';

export class AssetService {
  /**
   * Orchestrates asset generation for a specific project.
   * Scans all projects in portfolioData.json and generates missing images.
   */
  static async generatePortfolioAssets(projectId: number): Promise<void> {
    try {
      // 1. Get project instance info
      const { data: project } = await supabase
        .from('projects')
        .select('disk_path, id')
        .eq('id', projectId)
        .single();

      if (!project || !project.disk_path) throw new Error('Project disk path not found');

      const dataFilePath = this.findDataJson(project.disk_path);
      if (!dataFilePath) throw new Error('portfolioData.json not found');

      // 2. Read and normalize data
      const raw = fs.readFileSync(dataFilePath, 'utf-8');
      const data = normalizePortfolioData(JSON.parse(raw));
      const projects = data.projects as ParsedProject[];

      let changed = false;
      const publicAssetsDir = path.join(project.disk_path, 'public', 'assets', 'projects');
      if (!fs.existsSync(publicAssetsDir)) fs.mkdirSync(publicAssetsDir, { recursive: true });

      // 3. Process projects
      for (let i = 0; i < projects.length; i++) {
        const p = projects[i];
        
        // Skip if already has an image (that exists on disk)
        if (p.thumbnail && fs.existsSync(path.join(project.disk_path, 'public', p.thumbnail))) {
          continue;
        }

        // Generate image if possible
        if (typeof p === 'string') continue; // Type guard for ParsedProject vs string

        const prompt = p.imagePrompt || `${p.title}: ${p.description}`;
        const imageUrl = await AIService.generateProjectImage(prompt);
        
        if (imageUrl) {
          const fileName = `project-${i}-${Date.now()}.png`;
          const localRelPath = `/assets/projects/${fileName}`;
          const destPath = path.join(publicAssetsDir, fileName);
          
          await this.downloadImage(imageUrl, destPath);
          
          projects[i].thumbnail = localRelPath;
          changed = true;
          logger.info(`[AssetService] Generated and saved image for project: ${p.title}`);
        }
      }

      // 4. Save updated data back to disk
      if (changed) {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
        logger.info(`[AssetService] Updated portfolioData.json with new asset paths for project ${projectId}`);
      }

    } catch (err: any) {
      logger.error(`[AssetService] Asset generation failed for project ${projectId}:`, err.message);
    }
  }

  private static async downloadImage(url: string, destPath: string): Promise<void> {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(destPath);
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  private static findDataJson(diskPath: string): string | null {
    const candidates = ['public/portfolioData.json', 'portfolioData.json', 'data.json', 'public/data.json'];
    for (const c of candidates) {
      const full = path.join(diskPath, c);
      if (fs.existsSync(full)) return full;
    }
    return null;
  }
}
