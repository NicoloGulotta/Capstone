import GoogleStrategy from 'passport-google-oauth20'
import "dotenv/config";
import User from '../models/user.model.js';
import { generateJWT } from './auth.js';

const options = {
    // client id preso dalla console di google alla registrazione dell'applicazione
    clientID: process.env.G_CLIENT_ID,
    // client secret preso dalla console di google alla registrazione dell'applicazione
    clientSecret: process.env.G_CLIENT_SECRET,
    // callback da eseguire quando un utete effettua a'autentitacione all endpoint
    callbackURL: process.env.G_CALLBACK_URL
}
console.log(options);

// creo istanza GoogleStrategy
const googleStrategy = new GoogleStrategy(options, async (_accessToken, _refreshToken, profile, passportNext) => {
    // definiamo una funzione callback che viene chiamata in fase di autenticazione
    try {
        //Destrutturiamo l'ogetto profile e predniamo i dati che ci servono
        const { email, given_name, family_name, sub, picture } = profile._json;

        // verifica se l'utente esiste già nel database
        const user = await User.findOne({ email });
        // L'utente esiste già nel database?
        if (user) {
            //se esiste creiamo il token di accesso tramite servizio di googleStrategy
            const accToken = await generateJWT({
                _id: user._id
            });
            passportNext(null, { accToken })
        } else {
            // se l'utente non esiste nel database creiamo un nuovo utente
            const newUser = new User({
                username: email,
                googleId: sub,
                name: given_name,
                surname: family_name,
                avatar: picture,
                email: email,
            });
            //salva utente nel database
            await newUser.save();
            // generiamo token
            const accessToken = await generateJWT({
                _id: newUser._id
            });
            passportNext(null, { accessToken })
        }
    } catch (error) {
        passportNext(error)
        console.log("hello");
    }
});
export default googleStrategy;