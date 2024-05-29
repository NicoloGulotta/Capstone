import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import "dotenv/config";
import User from "../models/user.model.js";
import { generateJWT } from "./auth.js";

const options = {
    clientID: process.env.G_CLIENT_ID,
    clientSecret: process.env.G_CLIENT_SECRET,
    callbackURL: process.env.G_CALLBACK_URL,
};

const googleStrategy = new GoogleStrategy(
    options,
    async (_accessToken, _refreshToken, profile, done) => {
        try {
            const { email, given_name, family_name, sub, picture } = profile._json;

            let user = await User.findOne({
                $or: [{ email }, { googleId: sub }],
            });

            if (user) {
                user.name = given_name;
                user.surname = family_name;
                user.avatar = picture;
                await user.save();
            } else {
                user = new User({
                    username: email,
                    googleId: sub,
                    name: given_name,
                    surname: family_name,
                    avatar: picture,
                    email: email,
                });
                await user.save();
            }

            const accessToken = generateJWT({ _id: user._id });

            console.log("Utente da serializzare:", user);
            done(null, googleId, user, { accessToken });
        } catch (error) {
            console.error("Errore durante l'autenticazione:", error.message);
            if (error.oauthError) {
                // Errore specifico di OAuth (es. token non valido)
                return done(null, false, { message: error.oauthError.message });
            } else {
                // Altro tipo di errore
                return done(error);
            }
        }
    }
);

// Serializzazione e deserializzazione
passport.serializeUser(function (user, done) {
    done(null, user._id); // Converti ObjectId in stringa
});

passport.deserializeUser(async function (id, done) {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

export default googleStrategy;
