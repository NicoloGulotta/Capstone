import React, { useContext, useState } from "react";
import { Button, Spinner, Alert } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function GoogleAuth() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        setError(null); // Reset dell'errore

        try {
            await login(); // Chiamata alla funzione di login nel contesto
            navigate("/"); // Reindirizzamento dopo il login
        } catch (err) {
            setError(err.message || "Si è verificato un errore durante l'autenticazione.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {error && <Alert variant="danger">{error}</Alert>} {/* Mostra l'errore se presente */}
            <Button
                className="bg-dark m-3"
                onClick={handleGoogleAuth}
                disabled={isLoading}
            >
                {isLoading ? (
                    <Spinner animation="border" size="sm" />
                ) : (
                    "Accedi con Google"
                )}
            </Button>
        </>
    );
}

export default GoogleAuth;
