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
    const [token, setToken] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Login Function
    const login = (userData) => {
        setIsAuthenticated(true);
        setUser(userData.user);
        setToken(userData.token);
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData.user));
    };

    // Check Authentication on App Load
    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        // Check if storedUser is valid JSON
        if (storedUser && storedUser !== 'undefined') {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser && parsedUser.token) {
                    setIsAuthenticated(true);
                    setUser(parsedUser);
                    setToken(parsedUser.token);
                }
            } catch (e) {
                // Handle JSON parsing errors
                console.error('Errore nel parsing di JSON:', e);
            }
        } else {
            // Handle the case where the "user" data is not present or not JSON
            console.log("Dati utente non presenti o non validi in localStorage");
        }
    }, []);

    // Logout Function
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        navigate("/");
    };

    // Update User Data Function
    const updateUser = (updatedUserData) => {
        setUser(prevUser => ({ ...prevUser, ...updatedUserData }));
        localStorage.setItem("user", JSON.stringify({ ...user, ...updatedUserData }));
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
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
