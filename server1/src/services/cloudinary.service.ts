import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

/**
 * Upload the zip file to Cloudinary
 * Folder structure on Cloudinary:
 *   portfolio-builder/templates/{slug}/zip/{filename}
 * resource_type must be "raw" for zip files — not "image" or "auto"
 */
export async function uploadTemplateZip(
  filePath: string,
  slug: string,
  originalName: string
): Promise<CloudinaryUploadResult> {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'raw',
    folder: `portfolio-builder/templates/${slug}/zip`,
    public_id: originalName.replace(/\.zip$/, ''),
    overwrite: true,
    use_filename: true,
    unique_filename: false,
  });

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Upload an optional thumbnail image to Cloudinary
 * Folder structure:
 *   portfolio-builder/templates/{slug}/thumb/{filename}
 */
export async function uploadTemplateThumbnail(
  filePath: string,
  slug: string
): Promise<CloudinaryUploadResult> {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'image',
    folder: `portfolio-builder/templates/${slug}/thumb`,
    overwrite: true,
    transformation: [{ width: 800, crop: 'limit' }],
  });

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Upload multiple preview images to Cloudinary
 */
export async function uploadTemplatePreviews(
  filePaths: string[],
  slug: string
): Promise<CloudinaryUploadResult[]> {
  const uploadPromises = filePaths.map(path => 
    cloudinary.uploader.upload(path, {
      resource_type: 'image',
      folder: `portfolio-builder/templates/${slug}/previews`,
      transformation: [{ width: 1200, crop: 'limit' }],
    })
  );

  const results = await Promise.all(uploadPromises);
  return results.map(r => ({
    secureUrl: r.secure_url,
    publicId: r.public_id,
  }));
}

/**
 * Delete a file from Cloudinary by public_id (used if DB save fails after upload)
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'raw' | 'image' = 'raw'
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
