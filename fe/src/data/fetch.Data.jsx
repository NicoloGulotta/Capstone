import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

export const useFetchUserData = () => {
    const { setIsLoggedIn, setUserData } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await fetch('http://localhost:3001/auth/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (!response.ok) {
                        throw new Error('Errore nella risposta dal server');
                    }
                    const data = await response.json();
                    setIsLoggedIn(true);
                    setUserData(data);
                } catch (error) {
                    console.error('Errore nel recupero dei dati utente:', error);
                    setError(error.message);
                    setIsLoggedIn(false); // In caso di errore, assicurati che l'utente sia considerato non loggato
                    setUserData(null);   // Reset dei dati utente
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []); // Esegui l'effetto solo una volta al montaggio del componente

    // Funzioni di login e logout fornite dal context
    const { login, logout } = useContext(AuthContext);

    return { isLoading, isLoggedIn, userData, login, logout, error };
};
