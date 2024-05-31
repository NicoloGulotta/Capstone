import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { authMiddleware, generateJWT } from "../auth/auth.js";
import createError from "http-errors";
import { OAuth2Client } from 'google-auth-library';

const authRouter = Router();
const client = new OAuth2Client(process.env.G_CLIENT_ID); // Client OAuth2 di Google

// GET /auth/login: Restituisce una semplice pagina di login (o un redirect)
authRouter.get("/login", (req, res) => {
    // Puoi scegliere se inviare una pagina HTML di login o reindirizzare direttamente
    res.redirect(process.env.FRONTEND_URL + "/login"); // Esempio di redirect al frontend
});

// POST /auth/register: Registra un nuovo utente
authRouter.post("/register", async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await User.create({ ...req.body, password: hashedPassword });
        res.status(201).json(user); // 201 Created
    } catch (error) {
        if (error.code === 11000) { // Errore di duplicazione (es. email già esistente)
            return next(createError(409, "Email già registrata"));
        }
        next(error); // Altri errori
    }
});

// POST /auth/login: Effettua il login di un utente esistente
authRouter.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(createError(400, "Email e password sono obbligatori"));
        }

        const user = await User.findOne({ email }).select("+password"); // Includi il campo password
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return next(createError(401, "Credenziali non valide"));
        }

        // Genera il JWT
        const token = await generateJWT({ _id: user._id });

        // Dati dell'utente da inviare (escludi la password!)
        const userToSend = user.toObject();
        delete userToSend.password;

        res.json({ user: userToSend, token });
    } catch (error) {
        next(error);
    }
});

// GET /auth/profile: Ottiene i dati del profilo dell'utente autenticato
authRouter.get("/profile", authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .select("name surname email comments role appointments") // Personalizza i campi da includere
            .populate({
                path: "appointments",
                populate: { path: "serviceType" } // Popola i dettagli del tipo di servizio degli appuntamenti
            });

        if (!user) {
            return next(createError(404, "Utente non trovato"));
        }

        res.json(user);
    } catch (error) {
        next(createError(500, "Errore interno del server"));
    }
});

// GET /auth/check-admin: Verifica se l'utente è un amministratore
authRouter.get("/check-admin", authMiddleware, async (req, res, next) => {
    res.json({ isAdmin: req.user.role === "admin" }); // Invia un booleano per indicare se è admin
});

// PUT /auth/settings: Aggiorna i dati del profilo dell'utente autenticato
authRouter.put('/settings', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { name, surname, email, password } = req.body;

        const updateData = { name, surname, email };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!updatedUser) {
            return next(createError(404, "Utente non trovato"));
        }

        // Rimuovi il campo password dalla risposta
        const userWithoutPassword = updatedUser.toObject();
        delete userWithoutPassword.password;
        res.json(userWithoutPassword);
    } catch (error) {
        next(error);
    }
});

// GET /auth/google/callback: Callback per l'autenticazione Google
authRouter.get('/google/callback', async (req, res) => {
    try {
        const code = req.query.code;

        const { tokens } = await client.getToken(code);
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.G_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        // 1. Cerca l'utente nel database per email
        let user = await User.findOne({ email });

        if (!user) {
            // 2. Se non esiste, crea un nuovo utente
            user = new User({
                email,
                name,
                picture,
                // ... altri campi del tuo modello User ...
            });
            await user.save();
        } else {
            // 3. Se esiste, aggiorna i dati (se necessario)
            user.name = name; // Esempio di aggiornamento
            user.picture = picture;
            await user.save();
        }

        // 4. Genera il token JWT 
        const token = generateJWT({ _id: user._id });

        // 5. Imposta il token come cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'none', // necessario per i cookie cross-origin
        });

        // 6. Reindirizza al frontend
        res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000/');
    } catch (error) {
        console.error("Errore durante il callback di Google:", error);
        res.status(500).send("Errore durante l'autenticazione.");
    }
});


export default authRouter;
