import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Hook personalizzato per recuperare i dati dell'utente
export function useFetchUserData() {
    // Ottiene funzioni e dati dal contesto di autenticazione
    const { login, logout, error, setError, isAuthenticated } = useContext(AuthContext);

    // Stati locali per dati utente, caricamento ed errori
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        // Funzione asincrona per recuperare i dati utente
        const fetchUserData = async () => {
            setIsLoading(true); // Imposta lo stato di caricamento

            try {
                // Ottiene i dati utente salvati in localStorage
                const storedUser = JSON.parse(localStorage.getItem("user"));

                // Se l'utente è memorizzato e ha un token valido
                if (storedUser && storedUser.token) {
                    // Effettua una richiesta per ottenere il profilo dell'utente
                    const response = await fetch("http://localhost:3001/auth/profile", {
                        headers: { Authorization: `Bearer ${storedUser.token}` },
                    });

                    // Se la richiesta ha avuto successo
                    if (response.ok) {
                        const data = await response.json(); // Estrai i dati JSON dalla risposta
                        setUserData(data); // Aggiorna lo stato con i dati utente
                        login(data); // Effettua il login nel contesto di autenticazione
                        // Se il token è scaduto o non valido
                    } else if (response.status === 401) {
                        setError("Token scaduto o non valido"); // Imposta un messaggio di errore
                        logout(); // Effettua il logout
                        // Se c'è un altro errore nella richiesta
                    } else {
                        setError("Errore durante il recupero dei dati utente");
                    }
                }
            } catch (err) {
                setError("Errore di rete"); // Gestisce errori di rete
            } finally {
                setIsLoading(false); // Reimposta lo stato di caricamento
            }
        };

        fetchUserData(); // Chiama la funzione per recuperare i dati
    }, [login, logout, setError]);

    // Restituisce i valori necessari al componente che utilizza questo hook
    return {
        isLoading,
        isAuthenticated: !!userData, // isAuthenticated è true se userData non è null
        userData,
        error,
        setError,
        setIsLoading
    };
}