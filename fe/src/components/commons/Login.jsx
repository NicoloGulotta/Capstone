
import React, { useState, useContext } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function Login() {
    // Ottieni le funzioni e i valori dal contesto di autenticazione
    const { login, error, clearError, setError } = useContext(AuthContext);
    // Definisci lo stato locale per i dati del form (email e password)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const navigate = useNavigate(); // Hook per la navigazione

    // Funzione per gestire le modifiche nei campi del form
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Funzione per gestire l'invio del form
    const handleSubmit = async (e) => {
        e.preventDefault(); // Previeni il comportamento di invio predefinito del form
        clearError(); // Pulisci eventuali errori precedenti

        try {
            const response = await fetch("http://localhost:3001/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            // Se la richiesta ha avuto successo
            if (response.ok) {
                const data = await response.json();
                // Verifica se il token è stato restituito
                if (data.token) {
                    // Salva il token nel localStorage
                    localStorage.setItem("token", data.token);

                    login(data.user, data.token); // Autentica l'utente (aggiorna lo stato nel contesto)
                    navigate("/home"); // Reindirizza alla home
                } else {
                    setError("Autenticazione fallita. Token mancante nella risposta.");
                }
            } else {
                // Se la richiesta non ha avuto successo (es. credenziali errate)
                const errorData = await response.json();
                setError(errorData.message || "Login fallito. Verifica le tue credenziali.");
            }
        } catch (err) {
            // In caso di errore di rete o altri problemi
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

                <Button variant="primary" type="submit">
                    Login
                </Button>
            </Form>
        </div>
    );
}

export default Login;
