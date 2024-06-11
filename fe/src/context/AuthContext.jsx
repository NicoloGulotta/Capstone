import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
    error: null,
    setError: () => { },
});

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const login = useCallback((userData) => {
        setIsAuthenticated(true);
        setUser(userData.user);
        setToken(userData.token);
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData.user));
    }, [setIsAuthenticated, setUser, setToken]);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        navigate("/");
    }, [navigate]);

    // Verifica l'autenticazione al caricamento dell'app
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            setIsAuthenticated(true);
            setUser(storedUser);
            setToken(storedToken);
        } else {
            // Rimuoviamo token e user se non validi
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
        }
    }, []); // No dependencies needed here

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                setIsAuthenticated,
                user,
                setUser,
                token,
                setToken,
                login,
                logout,
                error,
                setError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
