import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

// Cloudinary credentials come from env — never hard-coded.
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
