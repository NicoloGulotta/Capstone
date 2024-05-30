import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import session from "express-session";
import { OAuth2Client } from 'google-auth-library';

// Importazione dei gestori di errore
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
dotenv.config();

// Creazione dell'app Express
const app = express();
const client = new OAuth2Client(process.env.G_CLIENT_ID); // Client OAuth2 di Google

// Middleware per la gestione delle sessioni
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }, // Imposta secure: true in produzione se usi HTTPS
    })
);

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

// Definizione delle rotte
app.use("/test", testRouter);
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/appointment", authMiddleware, appointmentRouter);

// Middleware per la gestione degli errori (ordine importante)
app.use(badRequestHandler);
app.use(unauthorizedHandler);
app.use(forbiddenHandler);
app.use(notFoundHandler);
app.use(conflictHandler);
app.use(tooManyRequestsHandler);
app.use(serviceUnavailableHandler);
app.use(errorHandler);

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
