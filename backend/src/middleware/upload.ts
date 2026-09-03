import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { ApiError } from '../utils/apiError.js';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES_PER_REQUEST = 5;

// Allowed MIME types for support ticket attachments
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
]);

// Reject these even if the MIME type somehow passes — secondary safeguard against
// disguised executables (e.g. a .exe renamed to .txt won't make it through MIME check,
// but the extension check adds defence-in-depth).
const BLOCKED_EXTENSIONS = new Set([
  '.exe', '.sh', '.bat', '.cmd', '.com', '.msi', '.dll',
  '.js', '.ts', '.jsx', '.tsx', '.py', '.rb', '.php',
  '.pl', '.ps1', '.vbs', '.jar', '.app', '.dmg',
]);

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(ApiError.badRequest(
      `File type "${file.mimetype}" is not allowed. Accepted types: images (JPEG, PNG, WEBP), PDF, Word, Excel, TXT, CSV.`
    ) as any);
  }

  const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return cb(ApiError.badRequest(
      `File extension "${ext}" is not permitted for security reasons.`
    ) as any);
  }

  cb(null, true);
}

// Files stay in memory — Cloudinary receives a stream from the buffer.
// This avoids writing anything to the container filesystem.
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: MAX_FILES_PER_REQUEST,
  },
});
