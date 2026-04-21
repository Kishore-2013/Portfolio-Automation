import { z } from 'zod';

export const applyResumeSchema = z.object({
  resumeId: z.string().uuid().optional(), // Using string/uuid to match the database/types package
  // if omitted, use the user's most recent resume
});

export type ApplyResumeInput = z.infer<typeof applyResumeSchema>;
