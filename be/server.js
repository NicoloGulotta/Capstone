import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';

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
import AppointmentRouter from './service/routes/appointmentRouter.js';

// Importazione del middleware di autenticazione e della strategia Google
import { authMiddleware } from './service/auth/auth.js';
import googleStrategy from './service/auth/passport.js';
app.set('trust proxy', true);
const app = express();

// Parsing del corpo delle richieste JSON
app.use(express.json());
express.urlencoded()
// Configurazione di Passport con la strategia Google
passport.use('google', googleStrategy);
app.use(passport.initialize()); // Inizializza Passport
app.use(passport.session());   // Abilita le sessioni per Passport (se necessario)
// Carica le variabili d'ambiente da .env
config();

// Configurazione CORS (Cross-Origin Resource Sharing)
const whitelist = ['https://']; // Origini consentite
const optionsCors = {
    origin: function (origin, callback) {
        // Consenti se l'origine è assente (richieste dallo stesso server)
        // o se corrisponde a un'origine nella whitelist
        if (!origin || whitelist.some((domain) => origin.startsWith(domain))) {
            callback(null, true);
        } else {
            callback(new Error('Non consentito da CORS'));
        }
    }
};
app.use(cors(optionsCors));


// Definizione delle route
app.use("/test", testRouter);        // Route di test (senza autenticazione)
app.use("/auth", authRouter);       // Route di autenticazione
app.use("/post", authMiddleware, postRouter);  // Route per i post (richiede autenticazione)
app.use("/appointment", authMiddleware, AppointmentRouter); // Route per gli appuntamenti (richiede autenticazione)

// Gestione degli errori
app.use(badRequestHandler);       // 400 Bad Request
app.use(unauthorizedHandler);     // 401 Unauthorized
app.use(forbiddenHandler);        // 403 Forbidden
app.use(conflictHandler);         // 409 Conflict
app.use(tooManyRequestsHandler);  // 429 Too Many Requests
app.use(serviceUnavailableHandler); // 503 Service Unavailable
app.use(notFoundHandler);         // 404 Not Found
app.use(errorHandler);            // Gestione generale degli errori

// Error handler generico per errori non gestiti (500 Internal Server Error)
app.use((err, req, res, next) => {
    console.error("Errore imprevisto:", err);
    res.status(500).send('Si è verificato un errore interno del server.');
});

// Funzione di inizializzazione del server
const initServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        app.listen(process.env.PORT, () => {
            console.log(`Server in ascolto sulla porta ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Errore durante l'avvio del server:", error); // Log dell'errore completo
    }
};

// Avvio del server
initServer();
