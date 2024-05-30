import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import dotenv from 'dotenv'; // Importa dotenv direttamente
import createError from 'http-errors';

dotenv.config(); // Carica le variabili d'ambiente

export const generateJWT = (payload) => {
    return new Promise((resolve, reject) => { // Usa resolve e reject invece di res e rej
        jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1d' }, (err, token) => {
            if (err) reject(err);
            else resolve(token);
        });
    });
};

export const verifyJWT = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) reject(err);
            else resolve(decoded);
        });
    });
};

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return next(createError(401, 'Token mancante'));
        }

        const decodedToken = await verifyJWT(token);

        // Non è necessario memorizzare il token o l'utente nel localStorage qui.
        // Lo farai nel tuo frontend dopo aver ricevuto la risposta dal backend.

        req.user = decodedToken;
        next();
    } catch (error) {
        // Messaggio di errore più informativo per il debug
        console.error("Errore di autenticazione:", error.name, error.message);

        if (error.name === 'JsonWebTokenError') {
            return next(createError(401, 'Token non valido'));
        } else if (error.name === 'TokenExpiredError') {
            return next(createError(401, 'Token scaduto'));
        } else {
            return next(createError(500, 'Errore interno del server'));
        }
    }
};
