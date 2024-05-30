import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv'; // Import corretto per dotenv
import createError from 'http-errors';

dotenv.config();

// Verifica delle variabili d'ambiente Cloudinary
if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
    throw new Error("Missing Cloudinary configuration variables");
}

// Configurazione Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Configurazione dello storage Cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'cover',
        allowedFormats: ['jpg', 'png', 'jpeg'],
    },
});

// Configurazione di Multer
const postCover = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (!file) {
            return cb(createError(400, 'Nessun file selezionato')); // Corretto il messaggio di errore
        }
        if (!file.mimetype.startsWith('image/')) {
            return cb(createError(400, `Tipo di file non valido: ${file.mimetype}. Sono consentite solo immagini.`)); // Corretto il messaggio di errore
        }
        cb(null, true); // Accetta il file se valido
    }
}).single('cover'); // Accetta un singolo file con il campo 'cover'

export default postCover;
