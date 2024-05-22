import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import '../../styles/Login.css';
import { Link } from 'react-router-dom';
const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:3001/Users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || 'Login failed');
            } else {
                const data = await response.json();
                const token = data.token;
                const User = data.User;

                // Store the token in local storage
                localStorage.setItem('authToken', token);

                // Redirect to the homepage or dashboard
                window.location.href = '/home';
            }
        } catch (error) {
            setError(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='d-flex align-items-center login-form justify-content-center vh-100'>
            <div className='p-3 rounded bg-black w-25 text-white login-container'>
                <h2 className='login-title'>Login</h2>
                {error && <p className="text-danger">{error}</p>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="inputEmail">Email address</Form.Label>
                        <Form.Control
                            type="email"
                            id="inputEmail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter email"
                            autoComplete="email"
                            autocorrect="off"
                            autocapitalize="off"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="inputPassword5">Password</Form.Label>
                        <Form.Control
                            type="password"
                            id="inputPassword5"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder="Enter password"
                        />
                        <Button as={Link} to="/registration" className=" bg-dark mt-3" >Registrati</Button>

                    </Form.Group>

                    <Button type="submit" className="btn m-2 d-flex btn-primary align-items-center justify-content-center">
                        {loading ? 'Loading...' : 'Accedi'}
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default LoginForm;