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
    // updateUser: (updatedUserData) => { },
    refetchUserData: () => { },
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
        const storedToken = localStorage.getItem("token");
        // Check if storedUser is valid JSON
        if (storedUser && storedToken) {
            setIsAuthenticated(true);
            setUser(storedUser);
            setToken(storedToken);
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

    // Refetch User Data Function
    const refetchUserData = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            const storedToken = localStorage.getItem("token");
            if (storedUser && storedUser.token) {
                const response = await fetch("http://localhost:3001/auth/profile", {
                    headers: { Authorization: `Bearer ${storedToken}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data); // Update user state
                    return data; // Return the updated user data
                } else {
                    throw new Error("Failed to refetch user data");
                }
            }
        } catch (error) {
            setError("Error refetching user data: " + error.message);
            throw error; // Rethrow the error to be handled by the calling component
        }
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
                refetchUserData,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};