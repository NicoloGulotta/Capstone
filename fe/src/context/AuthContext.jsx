import React, { createContext, useState, useEffect } from "react";

// Creazione del contesto di autenticazione
export const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    login: (user, token) => { },
    logout: () => { },
    error: null,
    clearError: () => { },
});

// Provider del contesto di autenticazione
export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        user: null,
    });
    const [error, setError] = useState(null);

    // Verifica se ci sono token e dati utente memorizzati nel localStorage al caricamento
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (storedToken && storedUser) {
            setAuthState({ isAuthenticated: true, user: storedUser });
        }
    }, []);

    // Funzione per gestire il login
    const login = (userData, token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setAuthState({ isAuthenticated: true, user: userData });
        setError(null);
    };

    // Funzione per gestire il logout
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuthState({ isAuthenticated: false, user: null });
    };

    // Funzione per cancellare eventuali errori
    const clearError = () => {
        setError(null);
    };

    // Ritorna il Provider del contesto, rendendo disponibili le funzioni e i dati ai componenti figli
    return (
        <AuthContext.Provider
            value={{
                ...authState,
                login,
                logout,
                error,
                setError,
                clearError
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};