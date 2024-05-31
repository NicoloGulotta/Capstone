// GoogleLoginButton.jsx
import { GoogleLogin } from '@react-oauth/google';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";


export default function GoogleLoginButton() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleGoogleSignIn = async (credentialResponse) => {
        try {
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ credential: credentialResponse.credential }),
            });

            if (response.ok) {
                const { user, token } = await response.json();
                login(user, token);

                //Reindirizza dopo il login
                navigate("/");

            } else {
                toast.error("Si è verificato un errore durante il login, riprova!")
                console.error('Errore durante il login con Google:', response.statusText);
            }
        } catch (error) {
            toast.error("Si è verificato un errore durante il login, riprova!")
            console.error('Errore durante il login con Google:', error);
        }
    };

    return (
        <GoogleLogin

            onSuccess={handleGoogleSignIn}
            onError={() => toast.error("Si è verificato un errore durante il login, riprova!")}
        />
    );
};
