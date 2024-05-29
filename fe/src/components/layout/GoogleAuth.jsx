import React, { useContext, useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function GoogleAuth() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function checkAuthentication() {
            try {
                const response = await fetch("http://localhost:3001/auth/profile", {
                    method: "GET",
                    credentials: "include", // Importante per inviare i cookie
                });
                if (response.ok) {
                    const data = await response.json();
                    login(data);
                    navigate("/");
                } else {
                    console.error("Errore durante la verifica dell'autenticazione:", response.statusText);
                    // Gestire l'errore (ad esempio, impostare un messaggio di errore)
                }
            } catch (error) {
                console.error("Errore durante la verifica dell'autenticazione:", error);
                // Gestire l'errore (ad esempio, impostare un messaggio di errore)
            }
        }

        checkAuthentication();
    }, [login, navigate]);

    const handleGoogleAuth = () => {
        setIsLoading(true);
        window.open("http://localhost:3001/auth/googlelogin", "_self");
    };


    return (
        <>
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
