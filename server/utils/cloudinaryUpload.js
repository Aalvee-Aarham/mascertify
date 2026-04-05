import { v2 as cloudinary } from 'cloudinary';

let configured = false;

export function isCloudinaryConfigured() {
  if (process.env.CLOUDINARY_URL?.trim()) return true;
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

function ensureConfig() {
  if (!isCloudinaryConfigured()) return false;
  if (!configured) {
    if (process.env.CLOUDINARY_URL?.trim()) {
      // SDK loads api_key, api_secret, cloud_name from CLOUDINARY_URL
      cloudinary.config(true);
    } else {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
    }
    configured = true;
  }
  return true;
}

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadBuffer(buffer, mimetype, folder) {
  if (!ensureConfig()) throw new Error('Cloudinary is not configured');
  if (!ALLOWED.includes(mimetype)) throw new Error('Only JPEG, PNG, or WebP images are allowed');
  if (buffer.length > MAX_BYTES) throw new Error('Image must be 5MB or smaller');
  const b64 = buffer.toString('base64');
  const dataUri = `data:${mimetype};base64,${b64}`;
  const res = await cloudinary.uploader.upload(dataUri, {
    folder: folder || 'mascertify',
    resource_type: 'image',
  });
  return { url: res.secure_url, publicId: res.public_id };
}

export async function deleteByPublicId(publicId) {
  if (!ensureConfig()) return;
  await cloudinary.uploader.destroy(publicId);
}
