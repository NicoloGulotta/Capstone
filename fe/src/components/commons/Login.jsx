
import React, { useState, useContext } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
// import GoogleAuth from "../layout/GoogleAuth";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import dotenv from "dotenv";
import { config } from "../../../../config.js";
dotenv.config();


function Login() {
    // Ottieni le funzioni e i valori dal contesto di autenticazione
    const { login, error, setError } = useContext(AuthContext);
    // Definisci lo stato locale per i dati del form (email e password)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const navigate = useNavigate(); // Hook per la navigazione
    async function responseMessage(response) {
        try {
            const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: {
                    Authorization: `Bearer ${response.access_token}`,
                },
            });
            const userInfo = await userInfoResponse.json();

            // Chiamata al backend per l'autenticazione e la gestione del token
            const loginResponse = await fetch("http://localhost:3001/auth/google", { // Assumi che il tuo endpoint sia /auth/google
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: response.credential, userInfo }), // Invia il token e i dati dell'utente
            });

            if (loginResponse.ok) {
                const data = await loginResponse.json();
                // Gestione del token e dei dati ricevuti dal backend
                localStorage.setItem("token", data.token);
                login(data);
                navigate("/");
            } else {
                // Gestione dell'errore di login
                const errorData = await loginResponse.json();
                setError(errorData.message || "Login fallito. Riprova più tardi.");
            }
        } catch (error) {
            console.error("Errore durante la richiesta di login:", error);
            setError("Errore di rete o del server. Riprova più tardi.");
        }
    }
    const errorMessage = (error) => {
        console.log(error);
    };
    // Funzione per gestire le modifiche nei campi del form
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Funzione per gestire l'invio del form
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3001/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();

                if (data.token) {
                    localStorage.setItem("token", data.token);
                    login(data); // Passa l'intero oggetto data a login
                    navigate("/");
                } else {
                    setError("Autenticazione fallita. Token mancante nella risposta.");
                }
            } else {
                const errorData = await response.json();
                setError(
                    errorData.message || "Login fallito. Verifica le tue credenziali."
                );
            }
        } catch (err) {
            console.error("Errore durante la richiesta di login:", err);
            setError("Errore di rete o del server. Riprova più tardi.");
        }
    };
    // Restituisci il JSX del componente
    return (
        <div>
            <h2>Login</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        placeholder="Inserisci email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Button variant="dark" type="submit">
                    Login
                </Button>
                {/* <GoogleAuth /> */}
                <GoogleOAuthProvider clientId={config.G_CLIENT_ID}>
                    <GoogleLogin
                        onSuccess={responseMessage}
                        onError={errorMessage}
                        useOneTap
                    />
                </GoogleOAuthProvider>
            </Form>
        </div>
    );
}

export default Login;
