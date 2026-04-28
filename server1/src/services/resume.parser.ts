import OpenAI from 'openai';
// pdfjs-dist legacy build works in Node.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');
import { ParsedData, ParsedExperience, ParsedEducation, SocialLinks } from '@/shared/types';
import { logger } from '@/shared/shared-utils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TextItem {
  text: string;
  x: number;
  y: number;
  isBold: boolean;
  page: number;
}

/*****************************************************************
 * 🔵 LAYER 1 — LAYOUT ENGINE (100% Deterministic)
 *****************************************************************/

async function extractTextItems(buffer: Buffer): Promise<TextItem[]> {
  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    useSystemFonts: true,
    disableFontFace: true,
    isEvalSupported: false
  });
  const pdfDoc = await loadingTask.promise;
  const items: TextItem[] = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const content = await page.getTextContent();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content.items.forEach((item: any) => {
      const [, , , , x, y] = item.transform;
      items.push({
        text: item.str.trim(),
        x, y, page: pageNum,
        isBold: item.fontName?.toLowerCase().includes('bold') || false
      });
    });
  }
  return items.filter(i => i.text.length > 0);
}

async function extractHyperlinks(buffer: Buffer): Promise<string[]> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdfDoc = await loadingTask.promise;
    const links: string[] = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const annotations = await page.getAnnotations();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      annotations.forEach((a: any) => {
        if (a.subtype === 'Link' && a.url) links.push(a.url);
      });
    }
    return [...new Set(links)];
  } catch {
    return [];
  }
}

function groupIntoLines(items: TextItem[]): TextItem[][] {
  items.sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x);
  const lines: TextItem[][] = [];
  const threshold = 3;

  items.forEach(item => {
    let line = lines.find(
      l => l[0].page === item.page && Math.abs(l[0].y - item.y) < threshold
    );
    if (!line) { line = []; lines.push(line); }
    line.push(item);
  });

  return lines.map(l => l.sort((a, b) => a.x - b.x));
}

function detectSections(lines: TextItem[][]): Record<string, string[]> {
  const sections: Record<string, string[]> = {};
  let current = 'CONTACT_INFO';
  sections[current] = [];

  const sectionKeywords = [
    'SUMMARY', 'PROFESSIONAL SUMMARY', 'PROFILE', 'ABOUT ME', 'OBJECTIVE',
    'EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'WORK HISTORY', 'EMPLOYMENT', 'CAREER',
    'SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES', 'TECHNOLOGIES', 'STRENGTHS', 'TOOLS',
    'PROJECTS', 'KEY PROJECTS', 'ACADEMIC PROJECTS',
    'EDUCATION', 'ACADEMIC BACKGROUND', 'QUALIFICATIONS',
    'CERTIFICATIONS', 'AWARDS', 'CERTIFICATES', 'LICENSE',
    'ACTIVITIES', 'ACHIEVEMENTS', 'ACCOMPLISHMENTS'
  ];

  lines.forEach(line => {
    const text = line.map(i => i.text).join(' ').trim();
    const upperText = text.toUpperCase();

    const isSection =
      (line.length === 1 && line[0].isBold && text.length < 50) ||
      (text.length < 60 && sectionKeywords.some(k => upperText === k || upperText.includes(k)));

    if (isSection && sectionKeywords.some(k => upperText === k || upperText.includes(k))) {
      const matchedKey = sectionKeywords.find(k => {
          if (upperText === k) return true;
          // Check for exact word match to avoid partial matches like "TOOLS" in "MY TOOLS ARE"
          return new RegExp(`\\b${k}\\b`).test(upperText);
      })!;
      if (matchedKey) {
          current = matchedKey;
          sections[current] = sections[current] ?? [];
      } else {
          sections[current].push(text);
      }
    } else {
      sections[current].push(text);
    }
  });

  return sections;
}

function getSection(sections: Record<string, string[]>, ...keywords: string[]): string[] {
  const keys = Object.keys(sections).filter(
    k => k !== 'CONTACT_INFO' && keywords.some(kw => k.toUpperCase().includes(kw.toUpperCase()))
  );
  
  let combined: string[] = [];
  keys.forEach(k => {
      combined = [...combined, ...sections[k]];
  });
  return combined;
}

function extractProfileDeterministic(profileLines: string[], links: string[]) {
  const combined = profileLines.join(' ');
  const name = profileLines[0] || '';

  const roleKeywords = ['engineer', 'developer', 'analyst', 'scientist', 'manager', 'designer',
    'architect', 'lead', 'director', 'specialist', 'consultant', 'administrator'];
  let targetRole = '';
  for (let i = 1; i < Math.min(4, profileLines.length); i++) {
    const line = profileLines[i].trim();
    const lower = line.toLowerCase();
    if (line.includes('@') || /[0-9]{5}/.test(line) || lower.includes('linkedin') || lower.includes('github')) continue;
    if (roleKeywords.some(kw => lower.includes(kw))) { targetRole = line; break; }
  }

  const email = combined.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] || '';
  const phone = combined.match(/(\+?\d[\d\s()\-]{8,}\d)/)?.[0] || '';
  const location = combined.match(/[A-Z][a-zA-Z\s]+,\s?[A-Z]{2}/)?.[0] || '';

  const EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'icloud.com', 'protonmail.com', 'live.com', 'aol.com', 'zoho.com', 'ymail.com', 'mail.com'];

  const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:com|io|dev|me|net|org|app|co|in)[^\s]*)/gi;
  const textUrls = (combined.match(urlPattern) || []).filter(u => {
    const lower = u.toLowerCase();
    if (lower.includes('@')) return false;
    if (EMAIL_DOMAINS.some(d => lower === d || lower.startsWith(d + '/'))) return false;
    const hasPath = lower.includes('/');
    const hasSubdomain = lower.split('.').length > 2 && !lower.startsWith('www.');
    const startsWithProto = lower.startsWith('http');
    if (!startsWithProto && !hasPath && !hasSubdomain) return false;
    return u.length > 5;
  });

  const allLinks = [...new Set([...links, ...textUrls])].map(l => l.toLowerCase());

  const socials: SocialLinks = {
    linkedin: allLinks.find(l => l.includes('linkedin.com')) || '',
    github: allLinks.find(l => l.includes('github.com')) || '',
    twitter: allLinks.find(l => l.includes('twitter.com') || l.includes('x.com')) || '',
    leetcode: allLinks.find(l => l.includes('leetcode.com')) || '',
    hackerrank: allLinks.find(l => l.includes('hackerrank.com')) || '',
    portfolio: allLinks.find(l =>
      !l.includes('linkedin.com') && !l.includes('github.com') &&
      !l.includes('twitter.com') && !l.includes('leetcode.com') &&
      !l.includes('hackerrank.com') && !l.includes('x.com') &&
      !l.includes('mailto') && (!!l && !EMAIL_DOMAINS.some(d => l.includes(d)))
    ) || ''
  };

  return { name, targetRole, email, phone, location, socials };
}

/*****************************************************************
 * 🔵 LAYER 2 — LLM EXTRACTION ENGINE
 *****************************************************************/

async function extractWithLLM(text: string, links: string[]): Promise<ParsedData> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: 'system',
        content: `You are an expert Resume Parser. Your goal is to extract structured data from a resume's text.
Guidelines:
1. **Meaningful Skills**: Extract skills as a flat array of technical terms (e.g. ["React", "Python", "ETL"]).
2. **Structured Experience**: Responsibilities must be in the 'bullets' field as a newline-separated string.
3. **Structured Projects**: Projects must be an array of objects, not a string. Extract title, description, and techStack for each.
4. **Structured Certifications**: Certifications must be an array of objects. Extract name, issuer, and date.
5. **Accuracy**: If a piece of information is missing, use an empty string or empty array as appropriate.`
      }, {
        role: 'user',
        content: `TEXT FROM RESUME:\n${text}\n\nEXTRACTED LINKS:\n${links.join('\n')}\n\nReturn a valid JSON object matching this schema:
{
  "personal": { "name": string, "email": string, "phone": string, "location": string, "linkedin": string, "github": string, "portfolio": string },
  "socialLinks": { "linkedin": string, "github": string, "twitter": string, "leetcode": string, "hackerrank": string, "portfolio": string },
  "summary": string,
  "targetRole": string,
  "skills": string[],
  "experiences": [{ "id": string, "title": string, "company": string, "period": string, "bullets": string }],
  "educations": [{ "id": string, "degree": string, "institution": string, "year": string, "grade": string }],
  "projects": [{ "title": string, "description": string, "techStack": string[], "link": string, "imagePrompt": string }],
  "certifications": [{ "name": string, "issuer": string, "date": string, "link": string }],
  "stats": [{ "label": string, "value": string }],
  "custom": []
}`
      }],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    const content = response.choices[0].message.content!;
    const parsed = JSON.parse(cleanJson(content)) as ParsedData;

    // Ensure IDs exist for frontend keys
    parsed.experiences = parsed.experiences.map(e => ({ ...e, id: e.id || Math.random().toString(36).substring(2, 11) }));
    parsed.educations = parsed.educations.map(e => ({ ...e, id: e.id || Math.random().toString(36).substring(2, 11) }));
    
    // Ensure unique and clean skills
    parsed.skills = [...new Set(parsed.skills)]
      .map(s => s.trim())
      .filter(s => s.length > 1 && !/^(etc|and|the|with)$/i.test(s));

    return parsed;
  } catch (err) {
    logger.error('LLM Extraction failed:', err);
    throw err;
  }
}

function cleanJson(text: string): string {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}

/*****************************************************************
 * 🏁 HYBRID ENTRY FUNCTION
 *****************************************************************/

export async function parseResumeHybrid(buffer: Buffer): Promise<ParsedData> {
  try {
    const items = await extractTextItems(buffer);
    const links = await extractHyperlinks(buffer);
    
    // Convert text items to a cohesive string for the LLM
    const lines = groupIntoLines(items);
    const rawText = lines.map(l => l.map(i => i.text).join(' ')).join('\n');

    if (!rawText.trim()) {
        throw new Error('No text content could be extracted from the PDF');
    }

    logger.info(`Sending ${rawText.length} characters to LLM for parsing...`);
    const data = await extractWithLLM(rawText, links);

    return {
      ...data,
      custom: data.custom || []
    };
  } catch (err) {
    logger.error('Critical error in hybrid parser:', err);
    return {
      personal: { name: 'Failed to Parse', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '' },
      socialLinks: { linkedin: '', github: '', twitter: '', leetcode: '', hackerrank: '', portfolio: '' },
      summary: '', targetRole: '', skills: [], experiences: [], educations: [],
      projects: [], certifications: [], custom: []
    };
  }
}

