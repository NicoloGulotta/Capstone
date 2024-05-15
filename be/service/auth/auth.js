// auth.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { config } from 'dotenv';
import createError from 'http-errors';

config(); // Carica le variabili d'ambiente

// Funzione per generare un JWT
export const generateJWT = (payload) =>
    new Promise((res, rej) => {
        jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1 day' }, (err, token) => {
            if (err) rej(err);
            else res(token);
        });
    });

// Funzione per verificare un JWT
export const verifyJWT = (token) =>
    new Promise((res, rej) => {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) rej(err);
            else res(decoded);
        });
    });

// Middleware di autenticazione
export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Estrai il token

        if (!token) {
            return next(createError(401, 'Token mancante'));
        }

        const decodedToken = await verifyJWT(token); // Usa await per gestire la promessa
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Errore di autenticazione:", error);

        // Verifica il tipo di errore JWT
        if (error.name === 'JsonWebTokenError') {
            return next(createError(401, 'Token non valido'));
        } else if (error.name === 'TokenExpiredError') {
            return next(createError(401, 'Token scaduto'));
        } else {
            return next(createError(500, 'Errore interno del server'));
        }
    }
}