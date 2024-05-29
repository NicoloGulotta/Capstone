import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useFetchUserData() {
    const { login, logout, error, setError, isAuthenticated } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);

            try {
                const storedUser = JSON.parse(localStorage.getItem("user"));
                if (storedUser && storedUser.token) {
                    const response = await fetch("http://localhost:3001/auth/profile", {
                        headers: { Authorization: `Bearer ${storedUser.token}` },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUserData(data);
                        login(data);
                    } else if (response.status === 401) {
                        setError("Token scaduto o non valido");
                        logout();
                    } else {
                        setError("Errore durante il recupero dei dati utente");
                    }
                }
            } catch (err) {
                setError("Errore di rete");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [login, logout, setError, isAuthenticated]);

    return {
        isLoading,
        isAuthenticated: !!userData,
        userData,
        error,
    };
}
