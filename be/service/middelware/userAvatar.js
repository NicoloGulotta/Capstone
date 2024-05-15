import multer from 'multer';
import {v2 as cloudinary} from 'cloudinary';
import {CloudinaryStorage} from 'multer-storage-cloudinary';
import { config } from 'dotenv';

// Configurazione di Cloudinary
config();
cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.CLOUD_API_KEY,
    api_secret : process.env.CLOUD_API_SECRET
});


export default multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: {
            folder : 'avatars' // dichiarazione della cartella su cloudinary
        }
    })
}).single('avatar'); //definizione del nome della key di Postman