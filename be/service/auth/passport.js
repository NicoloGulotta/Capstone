import GoogleStrategy from 'passport-google-oauth2';
import { generateJWT } from './auth.js';
import User from '../models/user.model.js';
import createError from "http-errors";

const options = {
    clientID: process.env.G_ID,
    clientSecret: process.env.G_SECRET,
    callbackURL: process.env.G_CALLBACK_URL,
    passReqToCallback: true
};

const googleStrategy = new GoogleStrategy(options, async (req, accessToken, refreshToken, profile, passportNext) => {
    try {
        const { email, family_name, given_name, sub, picture } = profile._json;

        // Verifica se l'utente esiste già
        let user = await User.findOne({ email });

        if (user) {
            // Aggiorna i dati dell'utente se necessario (ad es., avatar)
            if (user.avatar !== picture) {
                user.avatar = picture;
                await user.save();
            }

            const accToken = await generateJWT({ _id: user._id });
            passportNext(null, { ...user, accToken });
        } else {
            // Crea un nuovo utente
            const newUser = await User.create({
                email,
                name: given_name,
                surname: family_name,
                password: '', // Puoi generare una password casuale se necessario
                avatar: picture,
                googleId: sub
            });

            const accToken = await generateJWT({ _id: newUser._id });
            passportNext(null, { ...newUser, accToken }); // Include l'accessToken
        }
    } catch (error) {
        passportNext(createError(500, 'Errore durante l\'autenticazione Google'));
    }
});

export default googleStrategy;
