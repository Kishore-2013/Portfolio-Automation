import * as fs from 'fs';
import crypto from 'crypto';
import { supabase } from '@/shared/database';
import type { TemplateDTO } from '@/shared/types';
import { deleteFromCloudinary, uploadTemplateThumbnail, uploadTemplatePreviews } from './cloudinary.service';
import { RedisService } from './redis.service';

interface CreateTemplateParams {
  name: string;
  description: string;
  techStack: string[];
  domain: string;
  gitRepoUrl: string;
  thumbFilePath?: string;
  previewFilePaths?: string[];
}

/**
 * Creates a new template record in Supabase
 */
export async function createTemplate(
  params: CreateTemplateParams
): Promise<TemplateDTO> {
  const { name, description, techStack, domain, gitRepoUrl, thumbFilePath, previewFilePaths } = params;

  // Generate slug
  const generateSlug = (n: string) => n.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  let slug = generateSlug(name);

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from('templates')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
  }

  let thumbUpload: any = null;
  let previewUploads: any[] = [];
  let previewUrls: string[] = [];

  try {
    // Upload thumbnail if provided
    if (thumbFilePath) {
      console.log(`[TEMPLATE_CREATE] Uploading thumbnail to Cloudinary... Path: ${thumbFilePath}`);
      thumbUpload = await uploadTemplateThumbnail(thumbFilePath, slug);
      console.log(`[TEMPLATE_CREATE] Thumbnail upload success: ${thumbUpload.secureUrl}`);
    }

    // Upload multiple previews if provided
    if (previewFilePaths && previewFilePaths.length > 0) {
      console.log(`[TEMPLATE_CREATE] Uploading ${previewFilePaths.length} previews to Cloudinary...`);
      const results = await uploadTemplatePreviews(previewFilePaths, slug);
      previewUrls = results.map(r => r.secureUrl);
      previewUploads = results;
      console.log(`[TEMPLATE_CREATE] Previews upload success.`);
    }

    // Save to database
    console.log(`[TEMPLATE_CREATE] Generating unique ID and inserting into Supabase...`);
    const { data: template, error } = await supabase
      .from('templates')
      .insert({
        id: crypto.randomUUID(), // Explicitly generate ID to avoid NULL constraint
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
        console.error(`[TEMPLATE_CREATE] ❌ Supabase Insertion Failed:`, error);
        throw new Error('Could not create template: ' + error?.message);
    }

    console.log(`[TEMPLATE_CREATE] ✅ Template successfully created in DB with ID: ${template.id}`);
    
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
  } catch (err: any) {
    console.error(`[TEMPLATE_CREATE] 💥 CRITICAL ERROR:`, err);
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

/**
 * Bulk create templates (skips file uploads, assumes thumbUrl is provided or null)
 */
export async function bulkCreateTemplates(
  templates: any[]
): Promise<any[]> {
  const toInsert = templates.map(t => {
    let finalThumb = t.thumbUrl || null;
    
    // Auto-Screenshot Logic
    if (finalThumb && !finalThumb.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
        // If it's a website link but not a direct image, use the screenshot engine
        finalThumb = `https://s0.wp.com/mshots/v1/${encodeURIComponent(finalThumb)}?w=1280`;
    } else if (!finalThumb) {
        // High-quality tech placeholder fallback
        finalThumb = `https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1280&auto=format&fit=crop`;
    }

    return {
      id: crypto.randomUUID(),
      name: t.name,
      slug: t.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
      description: t.description,
      tech_stack: Array.isArray(t.techStack) ? t.techStack : ["React", "TailwindCSS"],
      domain: t.domain || 'Developer',
      git_repo_url: t.gitRepoUrl,
      thumb_url: finalThumb,
      is_active: true
    };
  });

  const { data, error } = await supabase
    .from('templates')
    .insert(toInsert)
    .select();

  if (error) throw error;
  
  await RedisService.invalidateTemplateCache();
  return data || [];
}

/**
 * Delete a template
 */
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
      await deleteFromCloudinary(publicId, 'image');
    } catch (err) {
      console.warn('Failed to delete thumbnail from Cloudinary during template deletion', err);
    }
  }

  const { error: deleteError } = await supabase
    .from('templates')
    .delete()
    .eq('id', id);

  if (deleteError) {
    throw deleteError;
  }

  await RedisService.invalidateTemplateCache();
}
