import { Request, Response, NextFunction } from 'express';
import { createTemplateSchema } from '@/shared/validation';
import { createTemplate, deleteTemplate } from '../services/template.service';
import { sendSuccess, ValidationError } from '@/shared/shared-utils';

export class TemplateController {
  
  /**
   * POST /api/admin/templates/upload
   * Content-Type: multipart/form-data
   * Fields: name, description, techStack (JSON string), domain, sourceUrl
   * Files: thumbFile (optional)
   */
  static upload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate text fields
      const parseResult = createTemplateSchema.safeParse(req.body);
      if (!parseResult.success) {
        return next(new ValidationError(parseResult.error.flatten().fieldErrors));
      }

      // Check for files
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const thumbFile = files?.thumbFile?.[0];
      const previewFiles = files?.previewFiles || [];

      const { name, description, techStack, domain, gitRepoUrl } = parseResult.data;

      const template = await createTemplate({
        name,
        description,
        techStack,
        domain,
        gitRepoUrl,
        thumbFilePath: thumbFile?.path,
        previewFilePaths: previewFiles.map(f => f.path),
      });

      sendSuccess(res, { template }, 201);
    } catch (err) {
      next(err);
    }
  };
  
  /**
   * POST /api/admin/templates/bulk
   * Expects: { templates: Array<{ name, description, techStack, domain, gitRepoUrl, thumbUrl? }> }
   */
  static bulkUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { templates } = req.body;
      if (!Array.isArray(templates)) {
        return res.status(400).json({ success: false, message: 'Templates array is required' });
      }

      // Simple import (no files, just metadata + urls)
      const { bulkCreateTemplates } = await import('../services/template.service');
      const results = await bulkCreateTemplates(templates);

      sendSuccess(res, { 
        count: results.length,
        results 
      }, 201);
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE /api/admin/templates/:id
   */
  static remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await deleteTemplate(id);
      sendSuccess(res, { message: 'Template deleted successfully' });
    } catch (err) {
      next(err);
    }
  };
}
