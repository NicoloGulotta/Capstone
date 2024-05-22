import GoogleStrategy from 'passport-google-oauth20';
import "dotenv/config";
import User from '../models/user.model.js';
import { generateJWT } from './auth.js';

const options = {
    clientID: process.env.G_CLIENT_ID,
    clientSecret: process.env.G_CLIENT_SECRET,
    callbackURL: process.env.G_CALLBACK_URL
};

//console.log(options);

const googleStrategy = new GoogleStrategy(options, async (_accessToken, _refreshToken, profile, done) => {
    try {
        const { email, given_name, family_name, sub, picture } = profile._json;


        // Cerca l'utente nel database per email o Google ID (corretto)
        let user = await User.findOne({ $or: [{ email }, { googleId: sub }] });

        if (user) {
            // Aggiorna i dati dell'utente esistente (se necessario)
            user.name = given_name;
            user.surname = family_name;
            user.avatar = picture;
            await user.save();
        } else {
            // Crea un nuovo utente
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

        // Genera un token JWT per l'utente autenticato
        const accessToken = await generateJWT({ _id: user._id });

        // Passa l'utente e il token a 'done' (corretto)
        done(null, { user, accessToken });
    } catch (error) {
        done(error);
        console.error("Errore durante l'autenticazione:", error);
    }
});

export default googleStrategy;
