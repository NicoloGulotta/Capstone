import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Settings() {
    const { user, token, logout } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: user.name,
        surname: user.surname,
        email: user.email,
        // ... altri campi del profilo ...
    });
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        setFormData({
            name: user.name,
            surname: user.surname,
            email: user.email,
            // ... altri campi del profilo ...
        });
    }, [user]);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch('http://localhost:3001/auth/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSuccess(true);
                // Aggiorna il contesto dell'utente con i nuovi dati (se necessario)
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Errore durante l\'aggiornamento del profilo');
            }
        } catch (error) {
            setError('Errore di rete durante l\'aggiornamento del profilo');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Impostazioni Profilo</h2>

            {success && <Alert variant="success">Profilo aggiornato con successo!</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
                {/* Campi del modulo per nome, cognome, email, ecc. */}
                {/* ... */}

                <Button variant="primary" type="submit" disabled={isLoading}>
                    {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
                </Button>
            </Form>

            <Button variant="danger" className="mt-3" onClick={logout}>
                Logout
            </Button>
        </div>
    );
}

export default Settings;
