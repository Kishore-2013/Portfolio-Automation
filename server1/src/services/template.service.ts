import * as fs from 'fs';
import { supabase } from '@/shared/database';
import type { TemplateDTO } from '@/shared/types';
import { deleteFromCloudinary, uploadTemplateThumbnail, uploadTemplatePreviews } from './cloudinary.service';
import { RedisService } from './redis.service';
import { logger } from '@/shared/shared-utils';

/**
 * Converts a display name to a url-safe slug
 * "Minimal Dark" → "minimal-dark"
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

export interface CreateTemplateParams {
  name: string;
  description: string;
  techStack: string[];
  domain: string;
  gitRepoUrl: string;
  thumbFilePath?: string;
  previewFilePaths?: string[]; // Multiple preview temp paths
}

export async function createTemplate(
  params: CreateTemplateParams
): Promise<TemplateDTO> {
  const {
    name,
    description,
    techStack,
    domain,
    gitRepoUrl,
    thumbFilePath,
    previewFilePaths,
  } = params;

  let slug = generateSlug(name);

  // Check slug is unique and increment if necessary
  const { data: existingCheck } = await supabase.from('templates').select('id').eq('slug', slug).single();
  let existing = existingCheck;
  let counter = 1;
  while (existing) {
    slug = `${generateSlug(name)}-${counter}`;
    const { data: loopCheck } = await supabase.from('templates').select('id').eq('slug', slug).single();
    existing = loopCheck;
    counter++;
  }

  let thumbUpload: { secureUrl: string; publicId: string } | null = null;
  let previewUrls: string[] = [];
  let previewUploads: { secureUrl: string; publicId: string }[] = [];

  try {
    // Upload thumbnail if provided
    if (thumbFilePath) {
      logger.info(`Uploading thumbnail for template "${name}"`, undefined);
      thumbUpload = await uploadTemplateThumbnail(thumbFilePath, slug);
    }

    // Upload multiple previews if provided
    if (previewFilePaths && previewFilePaths.length > 0) {
      logger.info(`Uploading ${previewFilePaths.length} previews for template "${name}"`, undefined);
      const results = await uploadTemplatePreviews(previewFilePaths, slug);
      previewUrls = results.map(r => r.secureUrl);
      previewUploads = results;
    }

    // Save to database
    const { data: template, error } = await supabase
      .from('templates')
      .insert({
        name,
        slug,
        description,
        tech_stack: techStack,
        domain,
        git_repo_url: gitRepoUrl,
        thumb_url: thumbUpload?.secureUrl ?? null,
        previews: previewUrls,
      })
      .select()
      .single();

    if (error || !template) {
        throw new Error('Could not create template: ' + error?.message);
    }

    logger.info(`Template "${name}" created with id ${template.id}`, undefined);

    // Invalidate cache
    await RedisService.invalidateTemplateCache();

    return {
      id: template.id,
      name: template.name,
      slug: template.slug,
      description: template.description,
      techStack: template.tech_stack,
      domain: template.domain,
      gitRepoUrl: template.git_repo_url,
      thumbUrl: template.thumb_url,
      previews: template.previews,
      isActive: template.is_active,
      createdAt: new Date(template.created_at),
      updatedAt: new Date(template.updated_at),
    };
  } catch (err) {
    // ROLLBACK
    if (thumbUpload) {
      await deleteFromCloudinary(thumbUpload.publicId, 'image').catch(() => { });
    }
    if (previewUploads.length > 0) {
      await Promise.all(previewUploads.map(pu => deleteFromCloudinary(pu.publicId, 'image').catch(() => {})));
    }
    throw err;
  } finally {
    // Clean up temp files
    if (thumbFilePath) { try { fs.unlinkSync(thumbFilePath); } catch { /* ignore */ } }
    if (previewFilePaths) {
      previewFilePaths.forEach(p => { try { fs.unlinkSync(p); } catch { /* ignore */ } });
    }
  }
}

export async function deleteTemplate(id: string): Promise<void> {
  const { data: template, error } = await supabase
    .from('templates')
    .select('*, projects:projects(id)')
    .eq('id', id)
    .single();

  if (error || !template) {
    throw new Error('Template not found');
  }

  const projectsCount = (template.projects as any)?.length || 0;
  if (projectsCount > 0) {
    throw new Error(
      `Cannot delete template because it is used by ${projectsCount} project(s).`
    );
  }

  // Delete from Cloudinary
  if (template.thumb_url) {
    try {
      const publicId = `portfolio-builder/templates/${template.slug}/thumb`;
      await deleteFromCloudinary(publicId, 'image').catch(() => {});
    } catch (err) {}
  }

  // Delete from database
  await supabase.from('templates').delete().eq('id', id);

  // Invalidate cache
  await RedisService.invalidateTemplateCache();
  logger.info(`Template "${template.name}" (id: ${id}) deleted successfully`, undefined);
}

