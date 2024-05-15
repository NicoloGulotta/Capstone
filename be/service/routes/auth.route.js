import { Router } from "express";
import bcrypt from "bcryptjs";
import User from '../models/user.model.js';
import { authMiddleware, generateJWT } from "../auth/auth.js";
import createError from 'http-errors'; // Per creare errori personalizzati
import passport from "../auth/passport.js";

const authRouter = Router();

// Route GET /: Restituisce una semplice pagina di login (puoi personalizzarla)
authRouter.get('/', (req, res) => {
    res.send('Login Page');
});

// Route POST /register: Registra un nuovo utente
authRouter.post('/register', async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        let user = await User.create({ ...req.body, password: hashedPassword });
        res.send(user);
    } catch (error) {
        next(error); // Passa l'errore al middleware di gestione degli errori
    }
});

// Route POST /login: Effettua il login di un utente esistente
authRouter.post('/login', async (req, res, next) => {
    try {
        const userFound = await User.findOne({ email: req.body.email }).select('+password'); // Includi la password nella query

        if (!userFound) {
            return next(createError(401, 'Invalid credentials'));
        }

        const isPasswordMatching = await bcrypt.compare(req.body.password, userFound.password);

        if (isPasswordMatching) {
            const token = await generateJWT({ _id: userFound._id });
            res.send({ user: userFound, token });
        } else {
            next(createError(401, 'Invalid credentials'));
        }
    } catch (error) {
        if (error.name === 'MongoServerError' && error.code === 13) {
            return next(createError(401, 'Invalid credentials'));
        } else {
            console.error("Errore durante il login:", error);
            next(error);
        }
    }
});


// Route GET /profile: Ottiene il profilo dell'utente autenticato (richiede autenticazione)
authRouter.get('/profile', authMiddleware, async (req, res, next) => {
    try {
        let user = await User.findById(req.user._id);
        res.send(user);
    } catch (error) {
        next(error);
    }
});

// Route GET /me: Verifica se l'utente è un amministratore (richiede autenticazione)
authRouter.get('/check-admin', authMiddleware, async (req, res, next) => { // Nome più descrittivo
    try {
        // Assumi che il tuo modello User abbia un campo 'isAdmin'
        if (req.user.isAdmin) {
            res.send(req.user); // Invia i dettagli dell'utente se è un amministratore
        } else {
            next(createError(403, 'Forbidden')); // Non autorizzato (403 Forbidden)
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
