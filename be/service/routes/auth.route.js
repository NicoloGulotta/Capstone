import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { authMiddleware, generateJWT } from "../auth/auth.js";
import createError from "http-errors";
import passport from "passport";

const authRouter = Router();

// GET /auth/login: Restituisce una semplice pagina di login
authRouter.get("/login", (req, res) => {
    res.send("Pagina di Login");
});

// POST /auth/register: Registra un nuovo utente
authRouter.post("/register", async (req, res, next) => {
    try {
        // Hash della password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Creazione del nuovo utente
        const user = await User.create({ ...req.body, password: hashedPassword });

        res.send(user); // Invia i dati dell'utente creato
    } catch (error) {
        next(error); // Passa l'errore al middleware di gestione degli errori
    }
});

// POST /auth/login: Effettua il login di un utente esistente
authRouter.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Verifica la presenza delle credenziali
        if (!email || !password) {
            return next(createError(400, "Email e password sono obbligatori")); // Errore se mancano credenziali
        }

        // Trova l'utente nel database
        const user = await User.findOne({ email }).select("+password"); // Includi il campo password nella query

        if (!user) {
            return next(createError(401, "Credenziali non valide")); // Errore se l'utente non esiste
        }

        // Confronta la password fornita con l'hash nel database
        const isPasswordMatching = await bcrypt.compare(password, user.password);

        if (isPasswordMatching) {
            // Genera un JWT per l'autenticazione
            const token = await generateJWT({ _id: user._id });

            // Carica gli appuntamenti dell'utente e i relativi commenti (se necessario)
            const userWithAppointmentsAndComments = await User.findById(user._id)
                .populate({
                    path: "appointments",
                    populate: {
                        path: "serviceType",
                        model: "Post",
                    },
                });

            // Rimuovi il campo password dalla risposta
            const userWithoutPassword = userWithAppointmentsAndComments.toObject();
            delete userWithoutPassword.password;

            res.send({ user: userWithoutPassword, token }); // Invia l'utente (senza password) e il token
        } else {
            next(createError(401, "Credenziali non valide")); // Errore se la password non corrisponde
        }
    } catch (error) {
        console.error("Errore durante il login:", error);
        next(error);
    }
});


authRouter.get("/profile", authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("name surname email comments role appointments "); // Proietta solo i campi necessari

        if (!user) {
            return res.status(404).json({ message: "Utente non trovato" }); // Errore 404 se l'utente non esiste
        }

        res.status(200).json(user); // Invia un codice di stato 200 per indicare successo
    } catch (error) {
        next(createError(500, "Errore interno del server")); // Errore 500 per errori generici del server
    }
});

// GET /auth/check-admin: Verifica se l'utente è un amministratore (richiede autenticazione)
authRouter.get("/check-admin", authMiddleware, async (req, res, next) => {
    try {
        if (req.user.isAdmin) {
            res.send(req.user);
        } else {
            next(createError(403, "Vietato")); // Errore se l'utente non è un amministratore
        }
    } catch (error) {
        next(error);
    }
});


authRouter.get('/googlelogin', (req, res, next) => {
    // Imposta le intestazioni CORS prima di avviare l'autenticazione
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Quindi, procedi con l'autenticazione
    passport.authenticate("google", {
        scope: ["profile", "email"],
        callbackURL: process.env.G_CALLBACK_URL
    })(req, res, next); // Chiama il middleware con req, res, next
});

authRouter.get('/callback',
    passport.authenticate("google", { session: false }), (req, res, next) => {
        try {
            if (!req.user || !req.user.accessToken) {
                return next(createError(401, 'Authentication failed'));
            }
            console.log(req);
            console.log(req.user.accessToken);
            // localStorage.setItem("token", req.user.accessToken);
            //  localStorage.setItem("user", JSON.stringify(req.user));
            res.redirect(`${process.env.FRONTEND_URL}?accessToken=${req.user.accessToken}`);
        } catch (error) {
            next(error);
        }
    });

export default authRouter;
