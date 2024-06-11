import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Container, Row, Col, InputGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../../context/AuthContext";
import CustomAlert from "../Alert";
import "../../styles/Login.css";

function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertData, setAlertData] = useState({ type: '', message: '' });
    const { login, error, setError } = useContext(AuthContext);
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
                console.log("Login successful:", data);
                localStorage.setItem("token", data.token);
                login(data);
                navigate("/");
            } else {
                // Login fallito
                const errorData = await response.json();
                setError(errorData.message || "Login failed.");
                setShowAlert(true); // Mostra l'alert
                setAlertData({ type: 'danger', message: "Password o email errati" });
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

    // const handleGoogleLogin = () => {
    //     const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
    //       response_type=code&
    //       client_id=ClientId&
    //       scope=profile%20email&
    //       redirect_uri=http://localhost:3001/google/callback`;

    //     window.location.href = authUrl;
    // };


    return (
        <Container className="my-5 login-container">
            <Row className="justify-content-center">
                <Col xs={12} md={8} lg={6}>
                    <div className="alert-container">
                        {showAlert && error && <CustomAlert {...alertData} />}
                    </div>
                    <div
                        className="login-form p-3 rounded bg-dark">
                        <h2 className="mb-3 text-white text-center">Login</h2>

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3 text-start" controlId="emailInput">
                                <Form.Label className="text-white">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    placeholder="Inserisci l'email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3 text-start" controlId="passwordInput">
                                <Form.Label className="text-white">Password</Form.Label>
                                <InputGroup> {/* InputGroup per il campo password */}
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Button variant="outline-secondary" onClick={togglePasswordVisibility}>
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                    </Button>
                                </InputGroup>
                            </Form.Group>

                            <div className="d-grid gap-2">
                                <Button variant="outline-light" type="submit">Login</Button>
                                {/* <Button variant="outline-primary" onClick={handleGoogleLogin} className="google-login-button">
                                    Accedi con Google
                                </Button> */}
                            </div>
                        </Form>

                        <p className="my-2 text-white text-center">Non hai un account?</p>
                        <div className="d-grid gap-2">
                            <Link to="/register" className="btn btn-outline-light">
                                Registrati
                            </Link>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;