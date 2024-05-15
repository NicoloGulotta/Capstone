import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import mongoose from 'mongoose';
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
import testRouter from './service/routes/test.route.js';
import authRouter from './service/routes/auth.route.js';
import postRouter from './service/routes/post.route.js';
import AppointmentRouter from './service/routes/appointmentRouter.js';
import { authMiddleware } from './service/auth/auth.js';

const app = express();

app.use(express.json());
app.use(cors());
config();


// Rotte
app.use("/test", testRouter);
app.use("/auth", authRouter);
app.use("/post", authMiddleware, postRouter);
app.use("/appointment", authMiddleware, AppointmentRouter)

// Error Handlers 
app.use(badRequestHandler);
app.use(unauthorizedHandler);
app.use(forbiddenHandler);
app.use(conflictHandler);
app.use(tooManyRequestsHandler);
app.use(serviceUnavailableHandler);
app.use(notFoundHandler);
app.use(errorHandler);

// Error handler generico
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Qualcosa è andato storto!');
});

// Connessione al Database e Avvio del Server
const initServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        app.listen(process.env.PORT, () => {
            console.log(`Server connected to port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Errore durante l'avvio del server:", error.message); // Messaggio di errore migliorato
    }
};

initServer();
