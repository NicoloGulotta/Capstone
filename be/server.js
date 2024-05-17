import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import googleStrategy from './service/auth/passport.js';
// Importazione dei gestori di errore personalizzati
import {
    badRequestHandler,
    unauthorizedHandler,
    forbiddenHandler,
    conflictHandler,
    tooManyRequestsHandler,
    serviceUnavailableHandler,
    errorHandler,
    notFoundHandler,
} from './service/auth/errorHandlers.js';

// Importazione delle route
import testRouter from './service/routes/test.route.js';
import authRouter from './service/routes/auth.route.js';
import postRouter from './service/routes/post.route.js';
import appointmentRouter from './service/routes/appointment.router.js';

// Importazione del middleware di autenticazione 
import { authMiddleware } from './service/auth/auth.js';

// Carica le variabili d'ambiente da .env
config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//utiliziamo la googleStrategy
passport.use("google", googleStrategy);

// Definizione delle route (dopo l'inizializzazione di Passport)
app.use("/test", testRouter);        // Route di test (senza autenticazione)
app.use("/auth", authRouter);       // Route di autenticazione
app.use("/post", authMiddleware, postRouter);  // Route per i post (richiede autenticazione)
app.use("/appointment", authMiddleware, appointmentRouter); // Route per gli appuntamenti (richiede autenticazione)

// Gestione degli errori centralizzata
app.use(badRequestHandler);     // 400 Bad Request
app.use(unauthorizedHandler);   // 401 Unauthorized
app.use(forbiddenHandler);      // 403 Forbidden
app.use(notFoundHandler);      // 404 Not Found
app.use(conflictHandler);       // 409 Conflict 
app.use(tooManyRequestsHandler); // 429 Too Many Requests
app.use(serviceUnavailableHandler); // 503 Service Unavailable 
app.use(errorHandler);          // Gestione generale degli errori

// Error handler generico per errori non gestiti (500 Internal Server Error)
app.use((err, req, res, next) => {
    console.error("Errore imprevisto:", err);
    res.status(500).send('Si è verificato un errore interno del server.');
});

// Connessione al Database e Avvio del Server
const initServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        app.listen(process.env.PORT, () => {
            console.log(`Server in ascolto sulla porta ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Errore durante l'avvio del server:", error);
    }
};

initServer();
