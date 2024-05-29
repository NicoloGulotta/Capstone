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
    updateToken: (newToken) => { },
});

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Funzione per gestire il login
    const login = (userData) => {
        setIsAuthenticated(true);
        setUser(userData.user);
        setToken(userData.token);
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData.user));
    };



    // Verifica e imposta l'autenticazione all'avvio
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
                }
            } catch (error) {
                console.error("Errore durante la verifica dell'autenticazione:", error);
            }
        }

        checkAuthentication();
    }, []);


    // Funzione per gestire il logout
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        navigate("/");
    };

    // Funzione per aggiornare i dati dell'utente
    const updateUser = (updatedUserData) => {
        setUser((prevUser) => ({ ...prevUser, ...updatedUserData }));
        localStorage.setItem(
            "user",
            JSON.stringify({ ...user, ...updatedUserData })
        );
    };

    // Funzione per aggiornare il token
    const updateToken = (newToken) => {
        setToken(newToken);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                token,
                login,
                logout,
                error,
                setError,
                updateUser,
                updateToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
