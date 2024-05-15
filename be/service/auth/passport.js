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

const googleStrategy = new GoogleStrategy(options, async (req, accessToken, refreshToken, profile, done) => {
    try {
        const { email, family_name, given_name, sub, picture } = profile._json;

        // Verifica se l'utente esiste già
        let user = await User.findOne({ email });

        if (user) {
            // Aggiorna i dati dell'utente se necessario
            user.avatar = picture;
            user.name = given_name;  // Aggiorna anche il nome
            user.surname = family_name; // Aggiorna anche il cognome
            await user.save();
        } else {
            // Crea un nuovo utente
            user = await User.create({
                email,
                name: given_name,
                surname: family_name,
                password: '', // O genera una password casuale sicura
                avatar: picture,
                googleId: sub,
                role: 'user' // Imposta il ruolo di default (se applicabile)
            });
        }

        const token = await generateJWT({ _id: user._id });

        // Personalizza l'oggetto utente restituito (rimuovi dati sensibili se necessario)
        const userToReturn = {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            // ... altri campi che da includere ...
        };

        done(null, { ...userToReturn, token });
    } catch (error) {
        console.error("Errore durante l'autenticazione Google:", error);
        done(error); // Passa l'errore a Passport per la gestione
    }
});

export default googleStrategy;
