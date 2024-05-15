// blogCover.js
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { config } from 'dotenv';
import createError from 'http-errors'; // importa la funzione per creare errori

config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'covers',
        allowedFormats: ['jpg', 'png', 'jpeg'] // Specifica i formati consentiti (opzionale)
    },
});

const blogCover = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(createError(400, "Il file deve essere un'immagine."));
        }
        cb(null, true);
    }
}).single('cover');

export default blogCover;