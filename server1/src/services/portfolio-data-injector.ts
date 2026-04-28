/**
 * injectPortfolioData
 * -------------------
 * Fetches the project's portfolio data from Supabase and writes it to
 * `public/portfolioData.json` inside the project's disk_path folder.
 */

import * as fs from 'fs';
import * as path from 'path';
import { supabase } from '@/shared/database';
import { IPortfolioData } from '@/shared/types';

// ── Fallback empty shape ──
export const EMPTY_PORTFOLIO: IPortfolioData = {
  personal: { name: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '' },
  socialLinks: { linkedin: '', github: '', twitter: '', leetcode: '', hackerrank: '', portfolio: '' },
  summary: '',
  targetRole: '',
  skills: [],
  experiences: [],
  educations: [],
  projects: [],
  certifications: [],
  custom: [],
};

export function normalizePortfolioData(raw: any): IPortfolioData {
  if (!raw) return EMPTY_PORTFOLIO;
  console.log('[INJECT_DATA] 🔄 Normalizing raw data. Input keys:', Object.keys(raw));

  const data = { ...EMPTY_PORTFOLIO, ...raw };

  // Personal Mapping (handling common parser variations)
  data.personal = {
    ...EMPTY_PORTFOLIO.personal,
    name: raw.personal?.name || raw.name || '',
    email: raw.personal?.email || raw.email || '',
    phone: raw.personal?.phone || raw.phone || '',
    location: raw.personal?.location || raw.location || '',
    linkedin: raw.personal?.linkedin || raw.linkedin || raw.socialLinks?.linkedin || '',
    github: raw.personal?.github || raw.github || raw.socialLinks?.github || '',
  };

  // Root fields
  data.summary = raw.summary || raw.personal?.summary || raw.about || '';
  data.targetRole = raw.targetRole || raw.personal?.targetRole || raw.role || '';

  // Skills
  if (Array.isArray(raw.skills)) {
    data.skills = raw.skills;
  } else if (typeof raw.skills === 'string') {
    data.skills = raw.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
  } else {
    data.skills = [];
  }

  // Experience
  const expSource = raw.experiences || raw.experience || [];
  if (Array.isArray(expSource)) {
    data.experiences = expSource.map((exp: any) => ({
      id: exp.id || Math.random().toString(36).substring(2, 11),
      title: exp.title || exp.role || 'Professional Role',
      company: exp.company || 'Company',
      period: exp.period || exp.duration || '',
      bullets: Array.isArray(exp.bullets) ? exp.bullets.join('\n') : (exp.bullets || exp.desc || exp.description || '')
    }));
  } else data.experiences = [];

  // Education
  const eduSource = raw.educations || raw.education || [];
  if (Array.isArray(eduSource)) {
    data.educations = eduSource.map((edu: any) => ({
      id: edu.id || Math.random().toString(36).substring(2, 11),
      degree: edu.degree || '',
      institution: edu.institution || edu.school || '',
      year: edu.year || edu.date || '',
      grade: edu.grade || ''
    }));
  } else data.educations = [];

  // Projects (Template expects a formatted string)
  const projSource = raw.projects || [];
  if (Array.isArray(projSource)) {
    data.projects = projSource.map((proj: any) => {
      const title = proj.title || proj.name || 'Project';
      const desc = proj.description || proj.desc || '';
      const tech = Array.isArray(proj.techStack) ? proj.techStack.join(', ') : (Array.isArray(proj.tech) ? proj.tech.join(', ') : '');
      return `${title}\n${desc}\nTech: ${tech}`;
    }).join('\n\n');
  } else {
    data.projects = String(projSource || '');
  }

  // Certifications (Template expects a newline-separated string)
  const certSource = raw.certifications || raw.certs || [];
  if (Array.isArray(certSource)) {
    data.certifications = certSource.map((cert: any) => {
      if (typeof cert === 'string') return cert;
      return `${cert.name || cert.title}${cert.issuer ? ` (${cert.issuer})` : ''}`;
    }).join('\n');
  } else {
    data.certifications = String(certSource || '');
  }

  console.log('[INJECT_DATA] ✅ Normalization result:', { 
    name: data.personal.name, 
    skills: data.skills.length,
    exps: data.experiences.length 
  });

  return data as IPortfolioData;
}

export async function injectPortfolioData(
  projectId: string | null,
  diskPath: string,
  userIdHint?: number
): Promise<void> {
  console.log(`[INJECT_DATA] 💉 Starting injection for project=${projectId}, diskPath=${diskPath}, userIdHint=${userIdHint}`);
  
  try {
    let finalData: IPortfolioData = EMPTY_PORTFOLIO;
    let userId: number | null = userIdHint || null;
    let dataLoaded = false;

    // Support for templates where the frontend app is in a 'web' subdirectory
    const appPath = fs.existsSync(path.join(diskPath, 'web')) 
      ? path.join(diskPath, 'web') 
      : diskPath;

    // 1. Priority 1: explicitly saved project portfolio_data
    if (projectId && projectId !== 'undefined') {
      console.log(`[INJECT_DATA] 🔍 Fetching project ${projectId} from Supabase...`);
      const { data: project, error } = await supabase
        .from('projects')
        .select('user_id, portfolio_data')
        .eq('id', projectId)
        .maybeSingle();

      if (error) {
        if (!error.message.includes('portfolio_data')) {
           console.error(`[INJECT_DATA] ❌ Supabase error fetching project:`, error.message);
        }
      } else if (project) {
        userId = project.user_id;
        console.log(`[INJECT_DATA] 👤 Project Owner ID: ${userId}`);
        if (project.portfolio_data && Object.keys(project.portfolio_data).length > 0) {
          console.log(`[INJECT_DATA] 📦 Found portfolio_data in DB for project ${projectId}`);
          finalData = normalizePortfolioData(project.portfolio_data);
          dataLoaded = true;
        } else {
          console.log(`[INJECT_DATA] ℹ️ project.portfolio_data is empty for ${projectId}`);
        }
      } else {
        console.warn(`[INJECT_DATA] ⚠️ Project ${projectId} not found in DB`);
      }
    }

    // 2. Priority 2: User's latest resume
    if (!dataLoaded && userId) {
      console.log(`[INJECT_DATA] 🔍 Fetching latest resume for user ${userId}...`);
      const { data: latestResume, error } = await supabase
        .from('resumes')
        .select('parsed_json')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(`[INJECT_DATA] ❌ Supabase error fetching resume:`, error.message);
      } else if (latestResume?.parsed_json) {
        console.log(`[INJECT_DATA] 📦 Found latest resume for user ${userId}. Keys:`, Object.keys(latestResume.parsed_json));
        finalData = normalizePortfolioData(latestResume.parsed_json);
        dataLoaded = true;
      } else {
        console.warn(`[INJECT_DATA] ⚠️ No resume found for user ${userId}`);
      }
    }

    // 3. Priority 3: Disk fallback (Legacy or Pre-sync)
    if (!dataLoaded) {
      const dataJsonPath = findDataJson(appPath);
      if (dataJsonPath) {
        try {
          console.log(`[INJECT_DATA] 🔍 Attempting disk fallback from ${dataJsonPath}`);
          const existing = JSON.parse(fs.readFileSync(dataJsonPath, 'utf-8'));
          finalData = normalizePortfolioData(existing);
          dataLoaded = true;
          console.log(`[INJECT_DATA] ✅ Loaded from disk fallback`);
        } catch (e: any) {
          console.error(`[INJECT_DATA] ❌ Error reading disk fallback:`, e.message);
        }
      }
    }

    // Final Validation
    if (!dataLoaded) {
      console.warn(`[INJECT_DATA] ⚠️ NO DATA FOUND from any source. Writing empty portfolio.`);
    }

    // Write it out
    console.log(`[INJECT_DATA] 📝 Finalizing write for user: ${finalData.personal.name || 'Anonymous'}`);
    writePublicJson(appPath, finalData);

    // Sync physical resume file
    if (userId) {
      try {
        await syncResumeFile(userId, appPath);
      } catch (err: any) {
        console.warn(`[INJECT_DATA] ⚠ Could not sync resume file: ${err.message}`);
      }
    }

    } catch (err: any) {
    console.error(`[INJECT_DATA] ❌ CRITICAL Error in injectPortfolioData:`, err.message, err.stack);
    const appPathFallback = fs.existsSync(path.join(diskPath, 'web')) ? path.join(diskPath, 'web') : diskPath;
    writePublicJson(appPathFallback, EMPTY_PORTFOLIO);
  }
}

async function syncResumeFile(userId: number, appPath: string): Promise<void> {
  const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
  if (!fs.existsSync(uploadsDir)) return;
  
  const files = fs.readdirSync(uploadsDir)
    .filter(f => f.startsWith(`resume-${userId}-`))
    .map(f => ({ 
      name: f, 
      path: path.join(uploadsDir, f), 
      mtime: fs.statSync(path.join(uploadsDir, f)).mtime 
    }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

  if (files.length === 0) return;
  
  const latest = files[0];
  const publicDir = path.join(appPath, 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  
  const target = path.join(publicDir, 'resume.pdf');
  fs.copyFileSync(latest.path, target);
  console.log(`[INJECT_DATA] 📄 Synced resume PDF to ${target}`);
}

function writePublicJson(appPath: string, data: IPortfolioData): void {
  const publicDir = path.join(appPath, 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  
  const target = path.join(publicDir, 'portfolioData.json');
  fs.writeFileSync(target, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[INJECT_DATA] 💾 Wrote portfolioData.json to ${target}`);
}

function findDataJson(appPath: string): string | null {
  const candidates = ['data.json', 'data/data.json', 'public/data.json', 'content/data.json', 'src/data.json'];
  for (const c of candidates) {
    const full = path.join(appPath, c);
    if (fs.existsSync(full)) return full;
  }
  return null;
}
