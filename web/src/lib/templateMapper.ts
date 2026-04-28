import { IPortfolioData } from '@/shared/types';

/**
 * Maps raw parsed resume data from the AI engine into the standard IPortfolioData schema.
 * Adds null-safe fallbacks and logs transformation steps.
 */
export const mapResumeToPortfolio = (parsed: any): IPortfolioData => {
  console.log('[TemplateMapper] 🗺️ Starting normalization flow...');

  // Fallback structure
  const defaultData: IPortfolioData = {
    personal: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: ''
    },
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
      leetcode: '',
      hackerrank: '',
      portfolio: ''
    },
    summary: '',
    targetRole: '',
    skills: [],
    experiences: [],
    educations: [],
    projects: [],
    certifications: [],
    custom: []
  };

  try {
    // 1. Personal Details Mapping
    const personal = {
      name: parsed.personal?.name || parsed.name || '',
      email: parsed.personal?.email || parsed.email || '',
      phone: parsed.personal?.phone || parsed.phone || '',
      location: parsed.personal?.location || parsed.location || '',
      linkedin: parsed.personal?.linkedin || parsed.socialLinks?.linkedin || '',
      github: parsed.personal?.github || parsed.socialLinks?.github || '',
      portfolio: parsed.personal?.portfolio || parsed.socialLinks?.portfolio || ''
    };
    console.log('[TemplateMapper] ✅ Personal details mapped:', personal.name);

    // 2. Skills Normalization
    let skills: string[] = [];
    if (Array.isArray(parsed.skills)) {
      skills = parsed.skills;
    } else if (typeof parsed.skills === 'string') {
      skills = parsed.skills.split(',').map((s: string) => s.trim());
    }
    console.log('[TemplateMapper] ✅ Skills normalized:', skills.length);

    // 3. Experience Mapping
    const experiences = (parsed.experiences || parsed.experience || []).map((exp: any, idx: number) => ({
      id: exp.id || `exp-${idx}`,
      title: exp.title || exp.role || 'Professional Role',
      company: exp.company || 'Organization',
      period: exp.period || exp.duration || '',
      bullets: Array.isArray(exp.bullets) ? exp.bullets.join('\n') : (exp.bullets || exp.description || '')
    }));

    // 4. Projects Mapping (Template expects a formatted string)
    let projects = '';
    const projSource = parsed.projects || [];
    if (Array.isArray(projSource)) {
      projects = projSource.map((proj: any) => {
        const title = proj.title || proj.name || 'Featured Project';
        const desc = proj.description || proj.desc || '';
        const tech = Array.isArray(proj.techStack) ? proj.techStack.join(', ') : (Array.isArray(proj.tech) ? proj.tech.join(', ') : '');
        return `${title}\n${desc}\nTech: ${tech}`;
      }).join('\n\n');
    } else {
      projects = String(projSource || '');
    }

    // 5. Education Mapping
    const educations = (parsed.educations || parsed.education || []).map((edu: any, idx: number) => ({
      id: edu.id || `edu-${idx}`,
      degree: edu.degree || '',
      institution: edu.institution || edu.school || '',
      year: edu.year || edu.date || '',
      grade: edu.grade || ''
    }));

    // 6. Certifications Mapping (Template expects a newline-separated string)
    let certifications = '';
    const certSource = parsed.certifications || parsed.certs || [];
    if (Array.isArray(certSource)) {
      certifications = certSource.map((cert: any) => {
        if (typeof cert === 'string') return cert;
        return `${cert.name || cert.title}${cert.issuer ? ` (${cert.issuer})` : ''}`;
      }).join('\n');
    } else {
      certifications = String(certSource || '');
    }

    const result: IPortfolioData = {
      ...defaultData,
      personal,
      summary: parsed.summary || parsed.about || '',
      targetRole: parsed.targetRole || parsed.role || '',
      skills,
      experiences,
      projects: projects as any, // Cast for interface compatibility if needed
      educations,
      certifications: certifications as any
    };

    console.log('[TemplateMapper] 🚀 Normalization complete.');
    return result;

  } catch (error) {
    console.error('[TemplateMapper] ❌ Normalization failed, returning defaults:', error);
    return defaultData;
  }
};
