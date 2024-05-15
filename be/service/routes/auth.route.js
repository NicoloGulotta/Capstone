import { Router } from "express";
import bcrypt from "bcryptjs";
import User from '../models/user.model.js';
import { authMiddleware, generateJWT } from "../auth/auth.js";
import createError from 'http-errors';
import passport from "../auth/passport.js";

const authRouter = Router();

// GET /auth/login: Restituisce una semplice pagina di login 
authRouter.get('/login', (req, res) => {
    res.send('Pagina di Login'); // Sostituisci con il tuo HTML di login
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
        const user = await User.findOne({ email: req.body.email }).select('+password');

        if (!user) {
            return next(createError(401, 'Credenziali non valide'));
        }

        const isPasswordMatching = await bcrypt.compare(req.body.password, user.password);

        if (isPasswordMatching) {
            const token = await generateJWT({ _id: user._id });
            res.send({ user, token });
        } else {
            next(createError(401, 'Credenziali non valide'));
        }
    } catch (error) {
        if (error.name === 'MongoServerError' && error.code === 13) {
            return next(createError(401, 'Credenziali non valide'));
        } else {
            console.error("Errore durante il login:", error);
            next(error);
        }
    }
});

// GET /auth/profile: Ottiene il profilo dell'utente autenticato (richiede autenticazione)
authRouter.get('/profile', authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.send(user);
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
// authRouter.get('/googleLogin', passport.authenticate('google', { scope: ['profile', 'email'] }));

// authRouter.get('/callback', passport.authenticate('google', { session: false }), (req, res, next) => {

//     try {
//         res.redirect('https://' + req.user.accToken);
//     } catch (error) {
//         next(error);
//     }


// });
export default authRouter;
