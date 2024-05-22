import { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";

export function useFetchUserData() {
    const { login, logout, error, clearError, setError } = useContext(AuthContext); //Get the error from context
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState(null); // Initialize userData here

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const response = await fetch("http://localhost:3001/auth/me", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        login(data, token);
                        setUserData(data);
                        clearError();
                    } else {
                        logout();
                        setError("Token scaduto o non valido"); // Imposta un messaggio di errore specifico
                    }
                }
            } catch (err) {
                setError(err.message || "An error occurred while fetching user data");
                localStorage.removeItem('token');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, [login, logout, setError, clearError]); // Add dependencies

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
