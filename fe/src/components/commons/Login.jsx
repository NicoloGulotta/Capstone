import React, { useState, useContext } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import '../../styles/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import GoogleAuth from '../layout/GoogleAuth';

const LoginForm = () => {
    const { login, error, clearError } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validazione dei campi
        if (!formData.email || !formData.password) {
            error('Compila tutti i campi');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                error(errorData.message || 'Login fallito');
            } else {
                const data = await response.json();
                const token = data.token;
                const user = data.user;
                console.log(token, user);
                login(user, token); // Chiama la funzione di login dal contesto
                navigate('/'); // Reindirizza alla homepage dopo il login riuscito
            }
        } catch (error) {
            error(error.message || 'Si è verificato un errore');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center login-form justify-content-center vh-100">
            <div className="p-3 rounded bg-black w-25 text-white login-container">
                <h2 className="login-title">Login</h2>
                <Form onSubmit={handleSubmit}>
                    <Form.Group >
                        <Form.Label htmlFor="email">Indirizzo Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Inserisci email"
                            autoComplete="email"
                            autoCorrect="off"
                            autoCapitalize="off"
                        />
                    </Form.Group>

                    <Form.Group >
                        <Form.Label htmlFor="password">Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                            placeholder="Inserisci password"
                        />
                    </Form.Group>

                    <Button type="submit" className="btn m-2 d-flex btn-primary align-items-center justify-content-center">
                        {loading ? 'Caricamento...' : 'Accedi'}
                    </Button>

                    <Button as={Link} to="/registration" className="bg-dark mt-3">
                        Registrati
                    </Button>

                    <GoogleAuth buttonText="Login con Google" className="bg-dark mt-3" />
                </Form>
            </div>
        </div>
    );
};

export default LoginForm;