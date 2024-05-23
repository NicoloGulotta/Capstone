import React, { createContext, useState, useEffect } from "react";

// Creazione del contesto di autenticazione
export const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    login: () => { },
    logout: () => { },
    error: null,
    setError: () => { },
    isLoggedOut: false, // Aggiunto per gestire il logout
});

// Provider del contesto di autenticazione
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [isLoggedOut, setIsLoggedOut] = useState(false); // Stato per gestire il logout

    // Verifica se ci sono token e dati utente memorizzati nel localStorage al caricamento
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (storedToken && storedUser) {
            setIsAuthenticated(true);
            setUser(storedUser);
        }
    }, []);

    // Funzione per gestire il login
    const login = (userData) => {
        setIsAuthenticated(true);
        setUser(userData);
        setIsLoggedOut(false);
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    // Funzione per gestire il logout
    const logout = (userData) => {
        localStorage.removeItem("token", userData.token);
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
        setIsLoggedOut(true);
    };

    // Ritorna il Provider del contesto, rendendo disponibili le funzioni e i dati ai componenti figli
    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                login,
                logout,
                error,
                setError,
                isLoggedOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
