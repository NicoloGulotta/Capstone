import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";

export function useFetchUserData() {
    const { login, logout, error, clearError, setError, isAuthenticated } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const userDataRef = useRef(userData);

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true); // Inizio del caricamento

            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const response = await fetch(`http://localhost:3001/auth/profile?userId=${userData._id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (response.ok) {
                        const data = await response.json();

                        // Verifica se i dati sono cambiati prima di aggiornare lo stato
                        if (JSON.stringify(data) !== JSON.stringify(userDataRef.current)) {
                            setUserData(data);
                            userDataRef.current = data; // Aggiorna il ref con i nuovi dati
                        }

                        login(data, token); // Update context with user data and token
                        clearError();
                    } else {
                        logout();
                        setError("Token scaduto o non valido");
                    }
                }
            } catch (err) {
                // Gestisci gli errori di rete
                setError("Errore durante il recupero dei dati utente");
                logout();
            } finally {
                setIsLoading(false); // Fine del caricamento
            }
        };

        fetchUserData();
    }, [login, logout, clearError, setError, isAuthenticated, userData]); // Aggiungiamo isAuthenticated come dipendenza

    return {
        isLoading,
        isLoggedIn: !!userData,
        userData,
        login,
        logout,
        error,
        clearError,
    };
}
