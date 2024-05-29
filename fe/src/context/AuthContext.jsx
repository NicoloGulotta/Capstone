import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
    error: null,
    setError: () => { },
    updateUser: (updatedUserData) => { },
});

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null); // Stato separato per il token
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Verifica e imposta l'autenticazione all'avvio
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedToken && storedUser) {
            setIsAuthenticated(true);
            setUser(storedUser);
            setToken(storedToken); // Imposta il token
        }
    }, []);

    // Funzione per gestire il login
    const login = (userData) => {
        setIsAuthenticated(true);
        setUser(userData);
        setToken(userData.token); // Imposta il token
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    // Funzione per gestire il logout
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
        setToken(null); // Reimposta il token
        navigate("/");
    };

    // Funzione per aggiornare i dati dell'utente
    const updateUser = (updatedUserData) => {
        setUser(prevUser => ({ ...prevUser, ...updatedUserData }));
        localStorage.setItem("user", JSON.stringify({ ...user, ...updatedUserData }));
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            token, // Includi il token nel valore del contesto
            login,
            logout,
            error,
            setError,
            updateUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
