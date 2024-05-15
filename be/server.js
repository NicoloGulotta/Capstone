import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import {
    badRequestHandler,
    unauthorizedHandler,
    notFoundHandler,
    forbiddenHandler,
    conflictHandler,
    tooManyRequestsHandler,
    serviceUnavailableHandler,
    errorHandler,
} from './service/auth/errorHandlers.js';
import testRouter from './service/routes/test.route.js';
import authRouter from './service/routes/auth.route.js';

config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/test", testRouter);
app.use("/auth", authRouter);

app.use(badRequestHandler);
app.use(unauthorizedHandler);
app.use(forbiddenHandler);
app.use(notFoundHandler);
app.use(conflictHandler);
app.use(tooManyRequestsHandler);
app.use(serviceUnavailableHandler);
app.use(errorHandler);

const initServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);

        app.listen(process.env.PORT, () => {
            console.log(`Server connected to port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("An error occurred while starting the server:", error.message); // Improved error logging
    }
};

initServer();
