import React, { useState, useContext, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "react-toastify/dist/ReactToastify.css"; // Stili per le notifiche (toast)
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"; // Icone per mostrare/nascondere la password
import { config } from "../../context/config"; // Configurazioni dell'app (es. client ID di Google)
import "../../styles/Login.css"; // Stili personalizzati per il componente

function Login() {
    // Context e gestione dello stato
    const { login, error, setError } = useContext(AuthContext); // Ottieni le funzioni di login e gestione degli errori dal contesto
    const [formData, setFormData] = useState({ email: "", password: "" }); // Stato per i dati del form
    const [showPassword, setShowPassword] = useState(false); // Stato per mostrare/nascondere la password
    const navigate = useNavigate(); // Hook per la navigazione

    // Verifica la presenza del Client ID di Google all'avvio del componente
    useEffect(() => {
        if (!config.REACT_APP_G_CLIENT_ID) {
            console.error("REACT_APP_G_CLIENT_ID non definito nel file di configurazione.");
        }
    }, []);

    // Funzione per gestire l'accesso con Google
    async function handleGoogleSignIn(credentialResponse) {
        try {
            // Invia una richiesta al backend per gestire l'autenticazione Google
            const loginResponse = await fetch("/auth/google/callback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    credential: credentialResponse.credential, // Invia il token ID di Google
                }),
            });

            if (loginResponse.ok) { // Se l'autenticazione ha successo
                const data = await loginResponse.json();
                localStorage.setItem("token", data.token); // Salva il token nel localStorage
                login(data); // Aggiorna il contesto di autenticazione
                navigate("/"); // Reindirizza alla home page
            } else { // Se l'autenticazione fallisce
                const errorData = await loginResponse.json();
                setError(errorData.message || "Google login failed."); // Imposta il messaggio di errore
            }
        } catch (error) {
            console.error("Error during Google login:", error.message);
            setError("An error occurred during Google login.");
        }
    }

    // Funzione per gestire le modifiche nei campi del form
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Funzione per gestire l'invio del form (login con email e password)
    const handleSubmit = async (e) => {
        e.preventDefault(); // Impedisci il comportamento predefinito del form

        try {
            // Invia una richiesta al backend per gestire l'autenticazione con email e password
            const response = await fetch("/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) { // Se l'autenticazione ha successo
                const data = await response.json();
                localStorage.setItem("token", data.token); // Salva il token nel localStorage
                login(data); // Aggiorna il contesto di autenticazione
                navigate("/"); // Reindirizza alla home page
            } else { // Se l'autenticazione fallisce
                const errorData = await response.json();
                setError(errorData.message || "Login failed. Check your credentials."); // Imposta il messaggio di errore
            }
        } catch (err) {
            console.error("Error during login request:", err.message);
            setError("Network or server error. Please try again later.");
        }
    };

    // Funzione per mostrare/nascondere la password
    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState);
    };
    return (
        <div className="login-form">
            <h2>Login</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="emailInput">
                    <Form.Label >Indirizzo Email</Form.Label>
                    <Form.Control
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Inserisci l'email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        aria-describedby="emailHelp" // Associa il campo all'help text
                    />
                    <Form.Text id="emailHelp" muted>
                        Non condivideremo la tua email con nessuno.
                    </Form.Text>
                </Form.Group>

                <Form.Group controlId="passwordInput">
                    <Form.Label htmlFor="password">Password</Form.Label>
                    <div className="input-group">
                        <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            aria-describedby="passwordHelp"
                        />
                        <div className="input-group-append align-self-center">
                            <Button variant="outline-secondary" onClick={togglePasswordVisibility}>
                                <FontAwesomeIcon className="my-3" icon={showPassword ? faEyeSlash : faEye} />
                            </Button>
                        </div>
                    </div>
                    <Form.Text id="passwordHelp" muted>
                        La password deve essere di almeno 8 caratteri.
                    </Form.Text>
                </Form.Group>

                <Button variant="primary" type="submit" className="my-3">
                    Login
                </Button>

                <GoogleOAuthProvider clientId={config.REACT_APP_G_CLIENT_ID}>
                    <GoogleLogin
                        onSuccess={handleGoogleSignIn}
                        onError={(err) => {
                            console.error("Google Login Error:", err.message);
                            setError("An error occurred during Google login.");
                        }}
                        useOneTap
                        redirect_uri="http://localhost:3001/auth/google/callback"
                        className="google-login-button"
                    />
                </GoogleOAuthProvider>
            </Form>
        </div>
    );
}

export default Login;
