import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { config } from 'dotenv';
import createError from 'http-errors'; // importa la funzione per creare errori

config(); // Carica le variabili d'ambiente

// Funzione per generare un JWT
export const generateJWT = (payload) =>
    new Promise((res, rej) => {
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1 day' }, (err, token) => {
            if (err) rej(err);
            else res(token);
        });
    });

// Funzione per verificare un JWT
export const verifyJWT = (token) =>
    new Promise((res, rej) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) rej(err);
            else res(decoded);
        });
    });

// Middleware di autenticazione
export const authMiddleware = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return next(createError(401, 'Effettua il login')); // Unauthorized (401)
        }

        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = await verifyJWT(token);

        if (decoded && decoded._id) {
            const user = await User.findById(decoded._id)

            if (user) {
                req.user = user;
                next();
            } else {
                return next(createError(404, 'Utente non trovato')); // Not Found (404)
            }

        } else {
            return next(createError(401, 'Token non valido.')); // Unauthorized (401)
        }
    } catch (error) {
        next(error); // Passa eventuali errori al prossimo middleware
    }
};
