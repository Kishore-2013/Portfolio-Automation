/**
 * injectPortfolioData
 * -------------------
 * Fetches the project's portfolio data from Supabase and writes it to
 * `public/portfolioData.json` inside the project's disk_path folder.
 *
 * The template reads this file at runtime via /portfolioData.json.
 * Must be called before spawning the Vite dev server.
 */

import * as fs from 'fs';
import * as path from 'path';
import { supabase } from '@/shared/database';
import { IPortfolioData } from '@/shared/types';

// ── Fallback empty shape (template renders gracefully when field is missing) ──

export const EMPTY_PORTFOLIO: IPortfolioData = {
  personal: {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
  },
  socialLinks: {
    linkedin: '',
    github: '',
    twitter: '',
    leetcode: '',
    hackerrank: '',
    portfolio: '',
  },
  summary: '',
  targetRole: '',
  skills: [],
  experiences: [],
  educations: [],
  projects: [],
  certifications: [],
  custom: [],
};

// ── Normalization Layer ───────────────────────────────────────────────────────

export function normalizePortfolioData(raw: any): IPortfolioData {
  const data = { ...EMPTY_PORTFOLIO, ...raw };

  // Normalize experiences
  if (Array.isArray(data.experiences)) {
    data.experiences = data.experiences.map((exp: any) => ({
      id: exp.id || Math.random().toString(36).substring(2, 11),
      title: exp.title || exp.role || 'Professional Role',
      company: exp.company || 'Company',
      period: exp.period || '',
      bullets: exp.bullets || exp.desc || exp.description || ''
    }));
  } else {
    data.experiences = [];
  }

  // Normalize educations
  if (Array.isArray(data.educations)) {
    data.educations = data.educations.map((edu: any) => ({
      id: edu.id || Math.random().toString(36).substring(2, 11),
      degree: edu.degree || '',
      institution: edu.institution || '',
      year: edu.year || '',
      grade: edu.grade || ''
    }));
  } else {
    data.educations = [];
  }

  // Normalize projects
  if (Array.isArray(data.projects)) {
    data.projects = data.projects.map((proj: any) => ({
      title: proj.title || proj.name || 'Project',
      description: proj.description || proj.desc || '',
      techStack: Array.isArray(proj.techStack) ? proj.techStack : (Array.isArray(proj.tech) ? proj.tech : []),
      link: proj.link || proj.url || proj.github || '',
      thumbnail: proj.thumbnail || '',
      imagePrompt: proj.imagePrompt || ''
    }));
  } else {
    data.projects = [];
  }

  // Normalize certifications
  if (Array.isArray(data.certifications)) {
    data.certifications = data.certifications.map((cert: any) => ({
      name: cert.name || '',
      issuer: cert.issuer || '',
      date: cert.date || '',
      link: cert.link || cert.url || ''
    }));
  } else {
    data.certifications = [];
  }

  // Normalize stats
  if (Array.isArray(data.stats)) {
    data.stats = data.stats.map((s: any) => ({
      label: s.label || '',
      value: s.value || ''
    }));
  } else {
    // Default fallback stats if AI hasn't generated them yet
    data.stats = [
      { label: 'Years Experience', value: '3+' },
      { label: 'Projects Completed', value: '10+' },
      { label: 'Technologies', value: '15+' }
    ];
  }

  return data as IPortfolioData;
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function injectPortfolioData(
  projectId: string,
  diskPath: string,
): Promise<void> {
  try {
    // 1. Fetch project to get user_id
    const { data: project } = await supabase
      .from('projects')
      .select('user_id, portfolio_data')
      .eq('id', projectId)
      .single();

    if (!project) throw new Error('Project not found');

    let finalData: IPortfolioData = EMPTY_PORTFOLIO;

    // 2. Priority 1: explicitly saved portfolio_data
    if (project.portfolio_data) {
       finalData = normalizePortfolioData(project.portfolio_data);
       console.log(`[INJECT_DATA] ✅ Loaded from projects.portfolio_data for project ${projectId}`);
    } 
    // 3. Priority 2: User's latest resume from 'resumes' table
    else {
      const { data: latestResume } = await supabase
        .from('resumes')
        .select('parsed_json')
        .eq('user_id', project.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestResume?.parsed_json) {
        finalData = normalizePortfolioData(latestResume.parsed_json);
        console.log(`[INJECT_DATA] ✅ Loaded from user's latest resume for project ${projectId}`);
      } 
      // 4. Priority 3: disk data.json (last resort - template default)
      else {
        const dataJsonPath = findDataJson(diskPath);
        if (dataJsonPath) {
          const existing = JSON.parse(fs.readFileSync(dataJsonPath, 'utf-8'));
          finalData = normalizePortfolioData(existing);
          console.log(`[INJECT_DATA] ✅ Loaded from disk fallback for project ${projectId}`);
        } else {
          console.warn(`[INJECT_DATA] ⚠ No data found for project ${projectId}. Using empty template.`);
        }
      }
    }

    writePublicJson(diskPath, finalData);

    // 5. Sync Project Resume File
    try {
      await syncResumeFile(project.user_id, diskPath);
    } catch (err: any) {
      console.warn(`[INJECT_DATA] ⚠ Could not sync resume file: ${err.message}`);
    }

  } catch (err: any) {
    console.error(`[INJECT_DATA] ❌ Error injecting data for ${projectId}:`, err.message);
    // Non-fatal, just fallback to empty
    writePublicJson(diskPath, EMPTY_PORTFOLIO);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function syncResumeFile(userId: number, diskPath: string): Promise<void> {
  const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
  if (!fs.existsSync(uploadsDir)) return;

  // Find all resume files for this user
  const files = fs.readdirSync(uploadsDir)
    .filter(f => f.startsWith(`resume-${userId}-`))
    .map(f => ({ name: f, path: path.join(uploadsDir, f), mtime: fs.statSync(path.join(uploadsDir, f)).mtime }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

  if (files.length === 0) {
    console.log(`[INJECT_DATA] No physical resume file found for user ${userId}`);
    return;
  }

  const latest = files[0];
  const publicDir = path.join(diskPath, 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const destPath = path.join(publicDir, 'resume.pdf');
  fs.copyFileSync(latest.path, destPath);
  console.log(`[INJECT_DATA] ✅ Synced latest resume to ${destPath}`);
}

function writePublicJson(diskPath: string, data: IPortfolioData): void {
  const publicDir = path.join(diskPath, 'public');
  fs.mkdirSync(publicDir, { recursive: true });
  const outPath = path.join(publicDir, 'portfolioData.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[INJECT_DATA] Wrote ${outPath}`);
}

function findDataJson(localPath: string): string | null {
  const candidates = [
    'data.json',
    'data/data.json',
    'public/data.json',
    'content/data.json',
    'src/data.json',
  ];
  for (const c of candidates) {
    const full = path.join(localPath, c);
    if (fs.existsSync(full)) return full;
  }
  return null;
}
