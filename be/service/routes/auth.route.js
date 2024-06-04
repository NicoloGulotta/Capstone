import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { authMiddleware, generateJWT } from "../auth/auth.js";
import createError from "http-errors";
import passport from "passport";
const authRouter = Router();

// --- ROTTE DI AUTENTICAZIONE ---

// GET /auth/login (Redirect al frontend)
authRouter.get("/login", (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/login`);
});

// POST /auth/register (Registrazione nuovo utente)
authRouter.post("/register", async (req, res, next) => {
    try {
        const { email, password, ...rest } = req.body; // Destrutturazione per evitare di salvare dati indesiderati
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword, ...rest });
        res.status(201).json({ message: "Registrazione avvenuta con successo" }); // Messaggio più informativo
    } catch (error) {
        if (error.code === 11000) { // Errore di duplicazione (es. email già esistente)
            return next(createError(409, "Email già registrata"));
        }
        next(error); // Altri errori
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
            .select("-password -__v") // Escludi password e __v
            .populate("appointments", "serviceType -_id"); // Popola solo l'ID del serviceType degli appuntamenti

        if (!user) {
            return next(createError(404, "Utente non trovato"));
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

// --- ROTTE GOOGLE AUTH ---
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

authRouter.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
    (req, res) => {
        res.redirect(`${process.env.FRONTEND_URL}`);
    }
);


export default authRouter;
