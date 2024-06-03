import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Form, Button, Alert, InputGroup, FormControl } from 'react-bootstrap';
import validator from 'validator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
function Settings() {
    const { user, token, updateUser, logout } = useContext(AuthContext);
    const navigate = useNavigate(); // hook per la navigazione

    // Stati per la visibilità delle password
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Stato per i dati del form, inizializzato con i dati dell'utente
    const [formData, setFormData] = useState({
        name: user?.name || '',
        surname: user?.surname || '',
        email: user?.email || '',
        password: '',
        confirmPassword: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    // Aggiorna i dati del form se i dati dell'utente cambiano
    useEffect(() => {
        setFormData({
            name: user?.name || '',
            surname: user?.surname || '',
            email: user?.email || ''
        });
    }, [user]);

    // Funzione per gestire le modifiche ai campi del form
    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    // Funzione per gestire l'invio del form
    const handleSubmit = async (event) => {
        event.preventDefault();
        navigate('/profile');
        // 1. Validazione dell'input (includi la validazione della password)
        if (!formData.name || !formData.surname || !formData.email) {
            return setError('Nome, cognome ed email sono obbligatori.');
        }
        if (!validator.isEmail(formData.email)) {
            return setError('Inserisci un indirizzo email valido.');
        }

        // Validazione della password (solo se modificata)
        if (formData.password || formData.confirmPassword) {
            if (formData.password !== formData.confirmPassword) {
                return setError('Le password non corrispondono.');
            }
            if (formData.password.length < 8) {
                return setError('La password deve essere di almeno 8 caratteri.');
            }
        }

        setIsLoading(true);

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
                const updatedUserData = await response.json();
                updateUser(updatedUserData);
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                }, 3000);
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

    // Funzioni per mostrare/nascondere la password
    const toggleShowPassword = () => setShowPassword(!showPassword);
    const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    return (
        <div className="container mt-5">
            <h2>Impostazioni Profilo</h2>
            {success && <Alert variant="success">Profilo aggiornato con successo!</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                {/* Altri campi del modulo per cognome, email, ecc. */}
                <Form.Group controlId="formName">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                </Form.Group>

                <Form.Group controlId="formSurname">
                    <Form.Label>Cognome</Form.Label>
                    <Form.Control type="text" name="surname" value={formData.surname} onChange={handleChange} required />
                </Form.Group>

                <Form.Group controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                </Form.Group>

                {/* Campi per la password */}
                <InputGroup className="mb-3">
                    <FormControl
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Nuova password"
                        aria-label="Nuova password"
                        aria-describedby="basic-addon2"
                    />
                    <Button variant="outline-secondary" onClick={toggleShowPassword}>
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </Button>
                </InputGroup>

                <InputGroup className="mb-3">
                    <FormControl
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Conferma password"
                        aria-label="Conferma password"
                        aria-describedby="basic-addon2"
                    />
                    <Button variant="outline-secondary" onClick={toggleShowConfirmPassword}>
                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </Button>
                </InputGroup>

                {/* Bottone di salvataggio */}
                <Button variant="primary" type="submit" disabled={isLoading}>
                    {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
                </Button>
                <Button variant="danger" className="m-3 ms-3" onClick={logout}>
                    Logout
                </Button>
            </Form>
        </div>
    );
}

export default Settings;
