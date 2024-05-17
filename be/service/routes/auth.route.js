import { Router } from "express";
import bcrypt from "bcryptjs";
import User from '../models/user.model.js';
import { authMiddleware, generateJWT } from "../auth/auth.js";
import createError from 'http-errors';
import passport from "passport";

const authRouter = Router();

// GET /auth/login: Restituisce una semplice pagina di login 
authRouter.get('/login', (req, res) => {
    res.send('Pagina di Login');
});

// POST /auth/register: Registra un nuovo utente
authRouter.post('/register', async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await User.create({ ...req.body, password: hashedPassword });
        res.send(user);
    } catch (error) {
        next(error);
    }
});

// POST /auth/login: Effettua il login di un utente esistente
authRouter.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Verifica la presenza delle credenziali
        if (!email || !password) {
            return next(createError(400, "Email e password sono obbligatori"));
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(createError(401, 'Credenziali non valide'));
        }

        const isPasswordMatching = await bcrypt.compare(password, user.password);

        if (isPasswordMatching) {
            const token = await generateJWT({ _id: user._id });

            // Popola gli appuntamenti e i commenti di ogni appuntamento
            const userWithAppointmentsAndComments = await User.findById(user._id)
                .populate({
                    path: 'appointments',
                    populate: {
                        path: 'comments',
                        model: 'Comment'
                    }
                });

            // Rimuovi il campo password dalla risposta
            const userWithoutPassword = userWithAppointmentsAndComments.toObject();
            delete userWithoutPassword.password;

            res.send({ user: userWithoutPassword, token });
        } else {
            next(createError(401, 'Credenziali non valide'));
        }
    } catch (error) {
        console.error("Errore durante il login:", error);
        next(error);
    }
});

// GET /auth/profile: Ottiene il profilo dell'utente autenticato (richiede autenticazione)
authRouter.get('/profile', authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.send(user);
        console.log(user);
    } catch (error) {
        next(error);
    }
});

// GET /auth/check-admin: Verifica se l'utente è un amministratore (richiede autenticazione)
authRouter.get('/check-admin', authMiddleware, async (req, res, next) => {
    try {
        if (req.user.isAdmin) {
            res.send(req.user);
        } else {
            next(createError(403, 'Vietato'));
        }
    } catch (error) {
        next(error);
    }
});

authRouter.get('/googlelogin',
    passport.authenticate("google", {
        scope: ["profile", "email"],
        callbackURL: process.env.G_CALLBACK_URL
    })
);
authRouter.get('/callback',
    passport.authenticate("google", { session: false }), (req, res, next) => {
        try {
            console.log(req);
            res.redirect(`${process.env.FRONTEND_URL}?accessToken=${req.user.accessToken}`);
        } catch (error) {
            next(error);
        }
    });
console.log(process.env.FRONTEND_URL);
console.log(process.env.G_CALLBACK_URL);
export default authRouter;
