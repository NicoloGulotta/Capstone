import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    login: (user, token) => { },
    logout: () => { },
    error: null,
    clearError: () => { },
});

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        user: null,
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (storedToken && storedUser) {
            setAuthState({ isAuthenticated: true, user: storedUser });
        }
    }, []);

    // In AuthContext.js
    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData)); // Memorizza i dati utente
        setAuthState({ isAuthenticated: true, user: userData }); // Aggiorna lo stato
        setError(null);
    };


    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuthState({ isAuthenticated: false, user: null });
    };

    const clearError = () => {
        setError(null);
    };

    return (
        <AuthContext.Provider
            value={{
                ...authState, // spread the isAuthenticated and user properties
                login,
                logout,
                error,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

