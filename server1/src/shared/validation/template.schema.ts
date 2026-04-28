import { z } from 'zod';

export const createTemplateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name too long'),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(300, 'Description too long'),

  // techStack comes from multipart form as a JSON string: '["React","Vite"]'
  techStack: z
    .string()
    .min(1, 'techStack required')
    .transform((val) => {
      try {
        const parsed = JSON.parse(val);
        if (!Array.isArray(parsed)) throw new Error();
        return parsed as string[];
      } catch {
        throw new Error('techStack must be a valid JSON array string');
      }
    }),

  domain: z
    .string()
    .min(2, 'Domain required')
    .max(50, 'Domain too long'),

  gitRepoUrl: z
    .string()
    .url('Invalid git repository URL')
    .regex(/\.git$|github\.com|bitbucket\.org/, 'Source must be a git repository URL'),
});

export type CreateTemplateBody = z.infer<typeof createTemplateSchema>;
