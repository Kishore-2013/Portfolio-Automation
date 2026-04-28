import fs from 'fs';
import fsPromises from 'fs/promises';
import { supabase } from '@/shared/database';
import { ParsedData } from '@/shared/types';
import { logger } from '@/shared/shared-utils';
import { parseResumeHybrid } from './resume.parser';
import path from 'path';

const OLLAMA_HOST = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const RESUME_UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'resumes');

export class ResumeService {

  static async parseOnly(filePath: string, userId: number): Promise<ParsedData> {
    let buffer: Buffer;

    try {
      buffer = fs.readFileSync(filePath);
      
      // Persist the file instead of deleting it
      if (!fs.existsSync(RESUME_UPLOADS_DIR)) fs.mkdirSync(RESUME_UPLOADS_DIR, { recursive: true });
      const persistentPath = path.join(RESUME_UPLOADS_DIR, `resume-${userId}-${Date.now()}.pdf`);
      fs.copyFileSync(filePath, persistentPath);
      logger.info(`[ResumeService] Persisted resume for user ${userId} at ${persistentPath}`);

    } catch (err) {
      logger.error('Failed to process PDF file:', err);
      throw new Error('Failed to process uploaded file');
    } finally {
      // Clean up temp file
      try { await fsPromises.unlink(filePath); } catch (_) { /* ignore */ }
    }

    // Check Ollama is available
    try {
      const { default: axiosDefault } = await import('axios');
      await axiosDefault.get(`${OLLAMA_HOST}/api/tags`, { timeout: 5000 });
    } catch {
      logger.warn(`Ollama is not running at ${OLLAMA_HOST}. Some refinement might fail.`);
    }

    return await parseResumeHybrid(buffer!);
  }

  static async saveParsedData(userId: string | number, parsed: ParsedData) {
    const { data: resume, error } = await supabase
      .from('resumes')
      .insert({
        user_id: Number(userId),
        parsed_json: parsed as any,
      })
      .select()
      .single();

    if (error || !resume) {
        throw new Error('Could not save resume data: ' + error?.message);
    }
    return resume;
  }

  static async applyToProject(userId: number, resumeId: number, projectId: number): Promise<void> {
    const { data: resume } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (!resume || Number(resume.user_id) !== userId) throw new Error('Resume not found');

    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (!project || Number(project.user_id) !== userId) throw new Error('Project not found');

    const parsed = resume.parsed_json as unknown as ParsedData;
    const tokens = {
      '{{NAME}}': parsed.personal.name,
      '{{EMAIL}}': parsed.personal.email,
      '{{PHONE}}': parsed.personal.phone,
      '{{LOCATION}}': parsed.personal.location,
      '{{SUMMARY}}': parsed.summary,
      '{{TITLE}}': parsed.targetRole || '',
      '{{SKILLS}}': parsed.skills.join(', '),
    };

    // Replace in all .jsx, .tsx, .html files in src
    const srcPath = path.join(project.disk_path, 'src');
    if (!fs.existsSync(srcPath)) return;

    const files = this.getAllFiles(srcPath);
    for (const f of files) {
      if (!f.match(/\.(jsx|tsx|html|js|ts)$/)) continue;
      let content = fs.readFileSync(f, 'utf-8');
      let changed = false;
      for (const [token, value] of Object.entries(tokens)) {
        if (content.includes(token)) {
          content = content.replace(new RegExp(token, 'g'), value || '');
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(f, content, 'utf-8');
      }
    }
  }

  static async getLatestResume(userId: number) {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'no rows found'
    return data;
  }

  private static getAllFiles(dir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(this.getAllFiles(file));
      } else {
        results.push(file);
      }
    });
    return results;
  }
}
