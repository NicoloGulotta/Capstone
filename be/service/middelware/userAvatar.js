import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv'; // Import corretto per dotenv

dotenv.config(); // Carica le variabili d'ambiente

// Verifica delle variabili d'ambiente di Cloudinary
if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
    throw new Error("Missing Cloudinary configuration variables");
}

// Configurazione di Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Configurazione dello storage Cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'avatars', // Cartella su Cloudinary dove verranno salvati gli avatar
        allowedFormats: ['jpg', 'png', 'jpeg'], // Formati consentiti (opzionale)
    },
});

// Configurazione di Multer
const uploadAvatar = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Validazione opzionale del tipo di file (immagine)
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Solo i file immagine sono consentiti!'));
        }
        cb(null, true);
    }
}).single('avatar'); // Accetta un singolo file con il campo 'avatar'

export default uploadAvatar;
