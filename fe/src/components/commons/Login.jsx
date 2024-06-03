import React, { useState, useContext, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { config } from "../../context/config";
// Carica le variabili d'ambiente dal file .env
// require("dotenv").config();

function Login() {
    const { login, error, setError } = useContext(AuthContext);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Verifica se il Client ID è presente nel file .env
        if (!process.env.REACT_APP_G_CLIENT_ID) {
            console.error("REACT_APP_G_CLIENT_ID is not defined in .env file.");
        }
    }, []);

    async function handleGoogleSignIn(credentialResponse) {
        try {
            const userInfoResponse = await fetch(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                {
                    headers: {
                        Authorization: `Bearer ${credentialResponse.credential}`,
                    },
                }
            );

            if (!userInfoResponse.ok) {
                throw new Error("Failed to fetch user info from Google.");
            }

            const userInfo = await userInfoResponse.json();

            const loginResponse = await fetch(
                "http://localhost:3001/auth/google/callback", // Assicurati che questo URL sia corretto
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        credential: credentialResponse.credential,
                        userInfo,
                    }),
                }
            );

            if (loginResponse.ok) {
                const data = await loginResponse.json();
                localStorage.setItem("token", data.token);
                login(data);
                navigate("/");
            } else {
                const errorData = await loginResponse.json();
                setError(errorData.message || "Google login failed.");
            }
        } catch (error) {
            console.error("Error during Google login:", error.message);
            setError("An error occurred during Google login.");
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3001/auth/login", { // Assicurati che questo URL sia corretto
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.token);
                login(data);
                navigate("/");
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Login failed. Check your credentials.");
            }
        } catch (err) {
            console.error("Error during login request:", err.message);
            setError("Network or server error. Please try again later.");
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState);
    };
    return (
        <div className="login-form">
            <h2>Login</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <Button variant="outline-secondary" onClick={togglePasswordVisibility} className="mt-2">
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </Button>
                </Form.Group>

                <Button variant="primary" type="submit" className="mb-3">
                    Login
                </Button>

                <GoogleOAuthProvider clientId={config.G_CLIENT_ID}>
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
