import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import "dotenv/config"; // Carica le variabili d'ambiente
import User from "../models/user.model.js";
import { generateJWT } from "./auth.js";

// Opzioni di configurazione per la strategia Google (ottieni i valori da .env)
const googleConfig = {
    clientID: process.env.REACT_APP_G_CLIENT_ID,
    clientSecret: process.env.G_CLIENT_SECRET,
    callbackURL: process.env.G_CALLBACK_URL,
};
//console.log(googleConfig);
// Strategia di autenticazione Google
passport.use(
    new GoogleStrategy(googleConfig, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const { email, given_name, family_name, sub, picture } = profile._json;

            // Utilizza upsert per trovare o creare l'utente in un'unica operazione
            const user = await User.findOneAndUpdate(
                { $or: [{ email }, { googleId: sub }] },
                {
                    username: email,
                    googleId: sub,
                    name: given_name,
                    surname: family_name,
                    avatar: picture,
                    email: email,
                },
                { upsert: true, new: true } // Crea l'utente se non esiste, altrimenti lo aggiorna
            );

            const accessToken = generateJWT({ _id: user._id });
            return done(null, user, { accessToken }); // Autenticazione riuscita
        } catch (error) {
            // Gestione più precisa degli errori
            if (error.oauthError) {
                return done(null, false, { message: error.oauthError.message, type: "oauth" });
            } else if (error.name === "MongoServerError" && error.code === 11000) {
                return done(null, false, { message: "Email già registrata", type: "duplicate" });
            } else {
                console.error("Errore durante l'autenticazione:", error);
                return done(error, false, { message: "Errore interno del server", type: "internal" });
            }
        }
    })
);

// Serializzazione e deserializzazione dell'utente (semplificate)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});
export default passport;