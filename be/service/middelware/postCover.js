import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { config } from 'dotenv';
import createError from 'http-errors'; // 

config();

// Check if environment variables are loaded
if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
    throw new Error("Missing Cloudinary configuration variables");
}

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'cover',
        allowedFormats: ['jpg', 'png', 'jpeg'],
    },
});

const postCover = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (!file) {
            return cb(createError(400, 'No file selected'));
        }
        if (!file.mimetype.startsWith('image/')) {
            return cb(createError(400, `Invalid file type: ${file.mimetype}. Only images are allowed.`));
        }
        cb(null, true);
    }
}).single('cover');

export default postCover;
