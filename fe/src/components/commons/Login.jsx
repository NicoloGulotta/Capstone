import React, { useState, useContext } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Login.css";

function Login() {
    // Stato per gestire i dati del form di login
    const [formData, setFormData] = useState({ email: "", password: "" });

    // Stato per mostrare/nascondere la password
    const [showPassword, setShowPassword] = useState(false);

    // Funzioni e valori dal contesto di autenticazione
    const { login, error, setError } = useContext(AuthContext);

    // Hook per la navigazione
    const navigate = useNavigate();

    // Funzione per gestire le modifiche nei campi del form
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Funzione per gestire l'invio del form di login
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Resetta eventuali errori precedenti

        try {
            // Invia una richiesta POST al backend per l'autenticazione
            const response = await fetch("http://localhost:3001/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                // Login riuscito
                const data = await response.json();
                localStorage.setItem("token", data.token); // Salva il token nel localStorage
                login(data); // Aggiorna il contesto di autenticazione
                navigate("/"); // Reindirizza alla home page
            } else {
                // Login fallito
                const errorData = await response.json();
                setError(errorData.message || "Login failed. Check your credentials.");
            }
        } catch (err) {
            // Errore di rete o del server
            console.error("Error during login request:", err.message);
            setError("Network or server error. Please try again later.");
        }
    };

    // Funzione per mostrare/nascondere la password
    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState);
    };

    // Funzione per gestire il login con Google
    const handleGoogleLogin = async () => {
        try {
            const response = await fetch("http://localhost:3001/auth/google"); // Richiesta al backend
            if (response.ok) {
                // Il backend dovrebbe reindirizzare a Google, quindi non è necessario fare altro qui
            } else {
                // Gestisci eventuali errori dal backend (ad esempio, se la rotta non esiste)
                console.error("Errore durante la richiesta di login con Google:", response.statusText);
            }
        } catch (err) {
            console.error("Errore di rete durante la richiesta di login con Google:", err.message);
        }
    };

    return (
        <div className="login-form">
            <h2>Login</h2>
            {error && <Alert variant="danger">{error}</Alert>} {/* Mostra un messaggio di errore se presente */}

            {/* Form di login tradizionale */}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="emailInput">
                    <Form.Label>Indirizzo Email</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        placeholder="Inserisci l'email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="passwordInput">
                    <Form.Label>Password</Form.Label>
                    <div className="input-group">
                        <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <div className="input-group-append align-self-center">
                            <Button variant="outline-secondary" onClick={togglePasswordVisibility}>
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </Button>
                        </div>
                    </div>
                </Form.Group>

                <Button variant="primary" type="submit" className="my-3">
                    Login
                </Button>
            </Form>

            {/* Pulsante per il login con Google */}
            <Button variant="outline-primary" onClick={handleGoogleLogin} className="my-2">
                Accedi con Google
            </Button>
        </div>
    );
}

export default Login;
