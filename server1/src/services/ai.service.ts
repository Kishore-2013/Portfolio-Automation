import OpenAI from 'openai';
import { logger } from '@/shared/shared-utils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIService {
  /**
   * Merges parsed resume data into the existing portfolio data template.
   * Returns a new JSON object that matches the template's schema exactly.
   */
  static async mergeResumeIntoPortfolioData(
    currentData: Record<string, any>,
    resumeData: Record<string, any>
  ): Promise<Record<string, any>> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured on the server. Please add it to your .env file.');
    }

    const prompt = `You are an expert ATS-friendly resume and portfolio builder AI.

I have an existing portfolio template data structure (JSON):
\`\`\`json
${JSON.stringify(currentData, null, 2)}
\`\`\`

And I have the user's parsed resume data:
\`\`\`json
${JSON.stringify(resumeData, null, 2)}
\`\`\`

TASK:
Create a NEW portfolio data object that matches the template's schema but uses ONLY the user's resume data.
1. **REPLACE EVERYTHING**: Do not keep any dummy data from the template (names, titles, companies). Replace it all with the resume content.
2. **STANDARD SECTIONS**: Fill 'personal', 'summary', 'skills', 'experiences', 'educations', 'projects', 'certifications'.
3. **DYNAMIC EXTENSION**: If the resume contains sections NOT in the standard list (e.g., Achievements, Publications, Volunteering, Languages, Awards, Hackathons), you MUST create a 'customSections' array.
4. Each item in 'customSections' should have:
   - "id": kebab-case identifier (e.g., "achievements")
   - "title": Human-readable title (e.g., "ACHIEVEMENTS")
   - "icon": A logical Lucide icon name (e.g., "Trophy", "Award", "Book", "Languages", "Users", "Zap")
   - "items": An array of objects: \`[{ "title": "...", "subtitle": "...", "description": "...", "date": "...", "link": "..." }]\`.

- **PROJECTS**: Convert into: \`[{ "title": "...", "description": "...", "techStack": ["..."], "link": "..." }]\`.
- **CERTIFICATIONS**: Convert into: \`[{ "name": "...", "issuer": "...", "date": "...", "link": "..." }]\`.
- **PROFESSIONAL TONE**: Convert all bullet points into engaging, professional descriptions.
- **OUTPUT**: Return ONLY the raw JSON object. No markdown wrappers, no explanation.`;

    logger.info('[AIService] Calling OpenAI gpt-4o for portfolio data merge...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'developer',
          content: 'You are a JSON-generating expert. Output ONLY raw valid JSON without any markdown code blocks or explanation.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const rawResult = response.choices[0]?.message?.content ?? '{}';
    return JSON.parse(rawResult);
  }

  /**
   * Generates a custom illustration for a project using DALL-E 3.
   */
  static async generateProjectImage(visualPrompt: string): Promise<string | null> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        logger.warn('[AIService] No OpenAI key, skipping image generation.');
        return null;
      }

      logger.info(`[AIService] Generating image for prompt: "${visualPrompt.substring(0, 50)}..."`);
      
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Professional, sleek, high-quality digital illustration for a portfolio project. Style: Modern, 3D isometric or clean flat design. Subject: ${visualPrompt}. Colors: Vibrant but professional.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      return response?.data?.[0]?.url || null;
    } catch (err: any) {
      logger.error('[AIService] Image generation failed:', err.message);
      return null;
    }
  }
}
