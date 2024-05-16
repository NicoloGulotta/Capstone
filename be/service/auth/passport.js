import GoogleStrategy from 'passport-google-oauth2';
import { generateJWT } from './auth.js';
import User from '../models/user.model.js';
import { config } from 'dotenv';
config();
const options = {
    clientID: process.env.G_ID,
    clientSecret: process.env.G_SECRET,
    callbackURL: process.env.G_CALLBACK_URL,
    passReqToCallback: true
}


const googleStrategy = new GoogleStrategy(options, async (req, accessToken, refreshToken, profile, passportNext) => {
    try {
        const { email, family_name, given_name, sub, picture } = profile._json;
        console.log(profile._json);

        // Verifica se l'utente esiste già nel database
        const admin = await User.findOne({ email });

        if (admin) {
            // L'utente esiste quindi creiamo un Token
            const accToken = await generateJWT({
                _id: admin._id
            })

            // Passiamo al prossimo middleware se tutto ok
            //  il primo argomento è un errore 
            // ... dentro googleStrategy
            passportNext(null, admin || newAdmin);
        } else {
            // L'utente non esiste quindi creiamo un nuovo utente
            const newAdmin = await User.create({
                email: email,
                nome: given_name,
                cognome: family_name,
                password: '',
                avatar: picture,
                googleId: sub
            });

            const accToken = await generateJWT({
                id: newAdmin._id
            });

            passportNext(null, { accToken });
        }

    } catch (error) {
        passportNext(error);
    }
});

export default googleStrategy;