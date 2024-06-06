import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import session from "express-session";
import passport from "./service/auth/passport.js";
import helmet from "helmet";

// Import middleware for error handling (consider using a dedicated error handling library)
import {
    notFoundHandler,
    badRequestHandler,
    unauthorizedHandler,
    forbiddenHandler,
    conflictHandler,
    tooManyRequestsHandler,
    serviceUnavailableHandler,
    errorHandler,
} from "./service/auth/errorHandlers.js";

// Importazione delle rotte
import authRouter from "./service/routes/auth.route.js";
import postRouter from "./service/routes/post.route.js";
import appointmentRouter from "./service/routes/appointment.router.js";

// Importazione del middleware di autenticazione (if applicable)
import { authMiddleware } from "./service/auth/auth.js";

// Carica le variabili d'ambiente
dotenv.config();

// Creazione dell'app Express
const app = express();

// Middleware
app.use(helmet());
app.use(express.json());

// Configurazione CORS (Cross-Origin Resource Sharing)
app.use(cors({
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
}));
// Gestione delle sessioni (opzionale)
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: process.env.NODE_ENV === "production" }, // Secure cookies in production
    })
);

// Inizializza passport
app.use(passport.initialize());
app.use(passport.session());

// Rotte dell'API
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/appointment", authMiddleware, appointmentRouter); // Apply auth middleware to specific routes

// Error handling middleware (place after routes)
app.use(notFoundHandler);
app.use(badRequestHandler);
app.use(unauthorizedHandler);
app.use(forbiddenHandler);
app.use(conflictHandler);
app.use(tooManyRequestsHandler);
app.use(serviceUnavailableHandler);
app.use(errorHandler);

// Connessione al database e avvio del server
const initServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connessione al database stabilita");

        app.listen(process.env.PORT, () => {
            console.log(`Server in ascolto sulla porta ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Errore durante l'avvio del server:", error);
        process.exit(1); // Exit on database connection error
    }
};

initServer();
