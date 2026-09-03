import { Readable } from 'stream';
import { cloudinary } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { IAttachmentMeta } from '../types/ticket.types.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/apiError.js';

export class UploadService {
  /**
   * Uploads an array of Multer memory buffers to Cloudinary.
   * If any upload fails, already-uploaded files are destroyed to avoid orphaned assets.
   */
  static async uploadFiles(files: Express.Multer.File[]): Promise<IAttachmentMeta[]> {
    if (!files || files.length === 0) return [];

    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      logger.error('Cloudinary credentials missing when file upload was attempted');
      throw ApiError.badRequest('File attachments are currently not configured on this server.');
    }

    const uploaded: IAttachmentMeta[] = [];

    try {
      for (const file of files) {
        const result = await UploadService.streamToCloudinary(file);
        uploaded.push({
          url: result.secure_url,
          publicId: result.public_id,
          fileName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        });
      }
    } catch (err) {
      // Roll back files that already made it to Cloudinary
      if (uploaded.length > 0) {
        logger.warn({ count: uploaded.length }, 'Attachment upload failed mid-batch — rolling back uploaded files');
        await UploadService.destroyFiles(uploaded.map((f) => f.publicId));
      }
      throw ApiError.internal('Failed to upload one or more attachments. Please try again.');
    }

    return uploaded;
  }

  /**
   * Streams a Multer buffer to Cloudinary using the upload_stream API.
   * The `resource_type: auto` lets Cloudinary detect whether it's an image,
   * PDF, or raw file — we don't need to specify it per-file.
   */
  private static streamToCloudinary(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'mini-helpdesk/attachments',
          resource_type: 'auto',
          use_filename: false, // use Cloudinary-generated ID to avoid collisions
          unique_filename: true,
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error('No result from Cloudinary'));
          resolve(result);
        }
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  /** Bulk-delete Cloudinary assets by public ID (used for rollback). */
  static async destroyFiles(publicIds: string[]): Promise<void> {
    await Promise.allSettled(
      publicIds.map((id) => cloudinary.uploader.destroy(id, { resource_type: 'raw' })
        .catch((e) => logger.warn({ publicId: id, err: e }, 'Failed to clean up Cloudinary asset'))
      )
    );
  }
}
