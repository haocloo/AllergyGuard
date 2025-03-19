import { validateImageFile } from '@/components/helpers/image-upload-input';
import { getSignedUrlForUpload } from '@/lib/r2';

export interface ImageFile {
  file?: File | null;
  preview: string;
}

export interface UploadResult {
  url: string;
  key: string;
}

export class ImageUploadManager {
  private readonly basePath: string;
  private readonly bucketUrl: string;

  constructor(basePath: string, bucketUrl = process.env.NEXT_PUBLIC_R2_BUCKET_URL) {
    this.basePath = basePath;
    this.bucketUrl = bucketUrl || '';
  }

  /**
   * Validates a single image file
   */
  async validateImage(file: File): Promise<void> {
    const validationResult = validateImageFile(file);
    if (!validationResult.isValid) {
      throw new Error(validationResult.error);
    }
  }

  /**
   * Uploads a single image and returns its URL
   */
  async uploadSingle(file: File, subPath: string = ''): Promise<UploadResult> {
    await this.validateImage(file);

    const fileName = file.name;
    const fileType = file.type;
    const fileSize = file.size;
    const fileKey = `${this.basePath}/${subPath}/${Date.now()}-${fileName}`.replace(/\/+/g, '/');

    const uploadUrl = await getSignedUrlForUpload(fileKey, fileType, fileSize);
    if (!uploadUrl) {
      throw new Error('Failed to get upload URL');
    }

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': fileType,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return {
      url: `${this.bucketUrl}/${fileKey}`,
      key: fileKey,
    };
  }

  /**
   * Uploads multiple images in parallel
   */
  async uploadMultiple(
    files: { [key: string]: File },
    subPath: string = ''
  ): Promise<{ [key: string]: UploadResult }> {
    const uploadPromises: { [key: string]: Promise<UploadResult> } = {};

    // Start all uploads in parallel
    for (const [key, file] of Object.entries(files)) {
      if (file) {
        uploadPromises[key] = this.uploadSingle(file, subPath);
      }
    }

    // Wait for all uploads to complete
    const results: { [key: string]: UploadResult } = {};
    for (const [key, promise] of Object.entries(uploadPromises)) {
      try {
        results[key] = await promise;
      } catch (error) {
        throw new Error(
          `Failed to upload ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return results;
  }

  /**
   * Handles image files from a form, uploading only the new ones
   */
  async handleFormImages(
    images: { [key: string]: ImageFile },
    subPath: string = ''
  ): Promise<{ [key: string]: string }> {
    const filesToUpload: { [key: string]: File } = {};

    // Collect files that need to be uploaded
    for (const [key, image] of Object.entries(images)) {
      if (image.file) {
        filesToUpload[key] = image.file;
      }
    }

    // If no new files, return existing previews
    if (Object.keys(filesToUpload).length === 0) {
      return Object.fromEntries(Object.entries(images).map(([key, image]) => [key, image.preview]));
    }

    // Upload new files
    const uploadResults = await this.uploadMultiple(filesToUpload, subPath);

    // Combine existing previews with new upload URLs
    return Object.fromEntries(
      Object.entries(images).map(([key, image]) => [
        key,
        image.file ? uploadResults[key].url : image.preview,
      ])
    );
  }
}
