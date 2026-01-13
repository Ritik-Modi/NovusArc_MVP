// src/utils/upload.ts
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage (stores files as buffers)
const storage = multer.memoryStorage();

// Create upload middleware
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedFormats = ['jpg', 'jpeg', 'png', 'pdf', 'webp'];
    const fileExtension = file.mimetype.split('/')[1];
    if (allowedFormats.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${allowedFormats.join(', ')}`));
    }
  },
});

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  originalFilename?: string,
  mimetype?: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Validate buffer
    if (!buffer || buffer.length === 0) {
      reject(new Error('Empty or invalid buffer'));
      return;
    }

    const isPdf = mimetype === 'application/pdf';
    
    // Extract filename without extension for public_id
    let publicId: string | undefined;
    if (originalFilename) {
      const lastDotIndex = originalFilename.lastIndexOf('.');
      publicId = lastDotIndex !== -1 
        ? originalFilename.substring(0, lastDotIndex)
        : originalFilename;
    }
    
    const uploadOptions: any = {
      folder,
      resource_type: isPdf ? 'raw' : 'auto',
      overwrite: true, // Allow overwriting existing files
    };
    
    if (publicId) {
      uploadOptions.public_id = publicId;
    }
    
    console.log('Cloudinary upload options:', uploadOptions);
    
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary stream error:', error);
          reject(error);
        } else {
          console.log('Cloudinary upload successful:', {
            url: result?.secure_url,
            bytes: result?.bytes,
            format: result?.format,
          });
          resolve(result);
        }
      }
    );

    // Write buffer to stream and handle errors
    uploadStream.on('error', (error) => {
      console.error('Upload stream error:', error);
      reject(error);
    });

    uploadStream.end(buffer);
  });
};
export { cloudinary };
export default upload;