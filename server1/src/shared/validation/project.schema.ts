import { z } from 'zod';

export const createProjectSchema = z.object({
  templateId: z.string().min(1, 'templateId is required'),
  name: z
    .string()
    .min(2, 'Project name must be at least 2 characters')
    .max(60, 'Project name too long')
    .optional(),
  // name is optional — if not provided, defaults to template name
});

export const saveFileSchema = z.object({
  content: z
    .string()
    .max(500_000, 'File content too large (max 500KB per file)'),
});

export const createSnapshotSchema = z.object({
  label: z.string().max(100, 'Label too long').optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type SaveFileInput = z.infer<typeof saveFileSchema>;
export type CreateSnapshotInput = z.infer<typeof createSnapshotSchema>;

