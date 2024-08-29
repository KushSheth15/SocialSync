/* eslint-disable camelcase */
/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable max-len */
import fs from 'fs';
import path from 'path';

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResponse {
    public_id: string;
    version: number;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    url: string;
    secure_url: string;
    original_filename: string;
}

const uploadOnCloudinary = async (localFilePath: string): Promise<CloudinaryUploadResponse | null> => {
  if (!localFilePath) {
    console.warn('No file path provided for upload.');
    return null;
  }

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resourceType: 'auto',
    });

    return response as CloudinaryUploadResponse;
  } catch (error) {
    console.error('Error uploading file:', (error as Error).message);
    return null;
  } finally {
    if (fs.existsSync(localFilePath)) {
      fs.unlink(localFilePath, unlinkError => {
        if (unlinkError) {
          console.error('Error deleting local file:', unlinkError.message);
        } else {
          console.log('Local file deleted successfully:', path.basename(localFilePath));
        }
      });
    }
  }
};

export default uploadOnCloudinary;
