import { z } from 'zod';

export const triggerDeploySchema = z.object({
  // projectId comes from URL param, no body needed
  // but future: allow deploy options like custom domain
  customDomain: z.string().url().optional(),
});

export type TriggerDeployInput = z.infer<typeof triggerDeploySchema>;
