import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

if (
  !CLOUDINARY_CLOUD_NAME ||
  !CLOUDINARY_API_KEY ||
  !CLOUDINARY_API_SECRET
) {
  throw new Error(
    'Missing Cloudinary environment variables. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
  );
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

const getCloudinaryErrorMessage = (error) => {
  if (!error) {
    return 'Unknown Cloudinary upload error.';
  }

  if (typeof error === 'string') {
    return error;
  }

  return (
    error?.message ||
    error?.response?.data?.error?.message ||
    error?.error?.message ||
    error?.name ||
    JSON.stringify(error)
  );
};

export const uploadImage = async (file) => {
  if (!file) {
    throw new Error('No image file provided for upload.');
  }

  try {
    const uploadTarget = file.path
      ? path.resolve(file.path)
      : file.tempFilePath
        ? path.resolve(file.tempFilePath)
        : null;

    if (!uploadTarget) {
      throw new Error('Uploaded file path is missing.');
    }

    const result = await cloudinary.uploader.upload(uploadTarget, {
      folder: 'staynest',
      resource_type: 'image',
    });

    return {
      secure_url: result.secure_url || result.url,
      public_id: result.public_id,
    };
  } catch (error) {
    const message = getCloudinaryErrorMessage(error);
    console.error('Cloudinary upload failed:', message);
    throw new Error(message);
  }
};

export default cloudinary;
