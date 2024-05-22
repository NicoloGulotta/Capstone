import React, { useState, useEffect, useContext } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Alert } from "react-bootstrap";

function Profile() {
    const { isAuthenticated, logout, setError } = useContext(AuthContext); // Ottieni isAuthenticated e logout dal contesto
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get("accessToken");

    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setProfileError] = useState(null); // Stato di errore specifico per il profilo

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);

            try {
                const response = await fetch("http://localhost:3001/auth/profile", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                    console.log(data);
                    setProfileError(null); // Cancella eventuali errori precedenti
                } else {
                    // Gestisci errori di autenticazione (es. token non valido)
                    if (response.status === 401) {
                        logout();
                        setError("Sessione scaduta. Effettua nuovamente il login.");
                        return <Navigate to="/login" />; // Reindirizza al login in caso di errore di autenticazione
                    } else {
                        setProfileError("Errore nel recupero dei dati dell'utente: " + response.statusText);
                    }
                }
            } catch (error) {
                setProfileError("Errore durante la richiesta: " + error.message);
            } finally {
                setIsLoading(false);
            }
        };

        // Esegui il fetch dei dati solo se l'utente è autenticato e ha un access token
        if (isAuthenticated && accessToken) {
            fetchUserData();
        } else {
            setIsLoading(false);
        }
    }, [accessToken, isAuthenticated, logout, setError]); // Dipendenze dell'effetto

    return (
        <div>
            <h1>Profilo Utente</h1>

            {/* Visualizza il messaggio di errore specifico per il profilo */}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Visualizza lo spinner di caricamento se i dati sono in fase di caricamento */}
            {isLoading ? (
                <p>Caricamento dati utente...</p>
            ) : (

                userData && (
                    <div>
                        {userData.avatar && <img src={userData.avatar} alt="Avatar" />}
                        <p>Nome: {userData.name}</p>
                        <p>Cognome: {userData.surname}</p>
                        <p>Email: {userData.email}</p>
                        {/* ... altri dati dell'utente ... */}
                    </div>
                )
            )}
        </div>
    );
}

export default Profile;
