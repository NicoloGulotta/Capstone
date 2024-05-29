import express from "express";
import cors from "cors";
import { config } from "dotenv";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport"; // <-- Rimuovi questa riga, era duplicata

// Importazione della strategia di Google e dei gestori di errore
import googleStrategy from "./service/auth/passport.js";
import {
    badRequestHandler,
    unauthorizedHandler,
    forbiddenHandler,
    conflictHandler,
    tooManyRequestsHandler,
    serviceUnavailableHandler,
    errorHandler,
    notFoundHandler,
} from "./service/auth/errorHandlers.js";

// Importazione delle rotte
import testRouter from "./service/routes/test.route.js";
import authRouter from "./service/routes/auth.route.js";
import postRouter from "./service/routes/post.route.js";
import appointmentRouter from "./service/routes/appointment.router.js";

// Importazione del middleware di autenticazione
import { authMiddleware } from "./service/auth/auth.js";

// Carica le variabili d'ambiente da .env
config();

// Creazione dell'app Express
const app = express();

// Middleware per la gestione delle sessioni
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }, // Imposta secure: true in produzione se usi HTTPS
    })
);

// Middleware per Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Altri middleware
app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);
app.use(express.json());

// Configurazione della strategia Google per Passport.js
passport.use("google", googleStrategy);

// Definizione delle rotte
app.use("/test", testRouter); // Route di test (senza autenticazione)
app.use("/auth", authRouter); // Route di autenticazione
app.use("/post", postRouter); // Route per i post
app.use(
    "/appointment",
    authMiddleware,
    appointmentRouter
); // Route per gli appuntamenti (richiede autenticazione)

// Middleware per la gestione degli errori (ordine importante)
app.use(badRequestHandler); // 400 Bad Request
app.use(unauthorizedHandler); // 401 Unauthorized
app.use(forbiddenHandler); // 403 Forbidden
app.use(notFoundHandler); // 404 Not Found
app.use(conflictHandler); // 409 Conflict
app.use(tooManyRequestsHandler); // 429 Too Many Requests
app.use(serviceUnavailableHandler); // 503 Service Unavailable
app.use(errorHandler); // Gestione generale degli errori

// Error handler generico per errori non gestiti (500 Internal Server Error)
app.use((err, req, res, next) => {
    console.error("Errore imprevisto:", err);
    res.status(500).send("Si è verificato un errore interno del server.");
});

// Connessione al database e avvio del server
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

