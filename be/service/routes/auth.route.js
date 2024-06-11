import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { authMiddleware, generateJWT } from "../auth/auth.js";
import createError from "http-errors";
import passport from "passport";
import jwt from "jsonwebtoken";
import "dotenv/config";

const authRouter = Router();


// --- ROTTE DI AUTENTICAZIONE ---

// GET /auth/login (Redirect al frontend)
authRouter.get("/login", (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/login`);
});

// POST /auth/register (Registrazione nuovo utente)
authRouter.post("/register", async (req, res, next) => {
    try {
        // 1. Estrai i dati dalla richiesta
        const { email, password, ...rest } = req.body;

        // 2. Normalizza l'email
        const normalizedEmail = email.trim().toLowerCase();

        // 3. Verifica se l'email è già registrata
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return next(createError(409, "Email già registrata"));
        }


        // 4. Hash della password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Crea il nuovo utente nel database
        const newUser = await User.create({
            email: normalizedEmail,
            password: hashedPassword,
            ...rest,
        });

        // 6. Genera il JWT (solo dopo la creazione dell'utente)
        const payload = {
            userId: newUser._id,
            user: {
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                // ... altri dati utente (opzionale)
            },
        };
        const { token, user: userData } = await generateJWT(payload);

        // 9. Risposta di successo (201 Created)
        res.status(201).json({
            message: "Registrazione avvenuta con successo",
            user: userData, // Dati utente (senza password)
            token: token,
        });

    } catch (error) {
        // 10. Gestione degli errori
        console.error("Errore durante la registrazione:", error);

        // Differenzia tra errori di validazione e altri errori del server
        if (error.name === 'ValidationError') {
            return next(createError(400, error.message)); // Errore 400 per validazione
        } else {
            return next(createError(500, "Errore interno del server")); // Errore 500 generico
        }
    }
});

// POST /auth/login (Login utente esistente)
authRouter.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return next(createError(401, "Credenziali non valide"));
        }

        const token = await generateJWT({ _id: user._id });
        const userToSend = user.toObject();
        delete userToSend.password;

        res.json({ user: userToSend, token });
    } catch (error) {
        next(error);
    }
});
// GET /auth/profile (Dati del profilo utente autenticato)
authRouter.get("/profile", authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .select("name email role appointments")
            .populate({
                path: "appointments",
                select: "serviceType date notes status",
                populate: {
                    path: "serviceType",
                    select: "title"
                }
            });

        if (!user) {

            return res.status(202).json({ message: "Registrazione completata. Profilo in elaborazione." });
        }

        res.json(user);

    } catch (error) {
        next(createError(500, "Errore interno del server"));
    }
});


// GET /auth/check-admin (Verifica ruolo amministratore)
authRouter.get("/check-admin", authMiddleware, (req, res) => {
    res.json({ isAdmin: req.user.role === "admin" });
});

// PUT /auth/settings (Aggiorna dati profilo)
authRouter.put("/settings", authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { name, surname, email, password } = req.body;

        const updateData = { name, surname, email };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password -__v"); // Escludi password e __v

        if (!updatedUser) {
            return next(createError(404, "Utente non trovato"));
        }

        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
});


// DELETE /auth/delete-account (Cancellazione account utente)
authRouter.delete("/delete-account", authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user._id;

        // 1. Chiedi conferma all'utente (opzionale ma consigliato)
        // Puoi farlo dal frontend o qui nel backend, se preferisci un controllo extra

        // 2. Cancella l'utente dal database
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return next(createError(404, "Utente non trovato"));
        }

        // 3. Revoca il token JWT (importante per invalidare la sessione)
        // Potresti farlo blacklistando il token o implementando una logica di scadenza forzata

        res.status(204).send(); // 204 No Content (successo senza contenuto da restituire)
    } catch (error) {
        next(error);
    }
});

// --- ROTTE GOOGLE AUTH ---
// Inizio dell'autenticazione Google
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback di Google (dopo l'autenticazione)
authRouter.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET);
        res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
    }
);

export default authRouter;
