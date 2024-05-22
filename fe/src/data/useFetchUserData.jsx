import { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";

export const useFetchUserData = () => {
    // rimuovi setError da qui
    const { setIsLoggedIn, setUserData } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // Move error state declaration here

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const response = await fetch("http://localhost:3001/auth/profile", {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    // Check if the request was successful (status code 200-299)
                    if (response.ok) {
                        const data = await response.json();
                        setIsLoggedIn(true);
                        setUserData(data);
                    } else {
                        // Throw an error if the request was not successful
                        throw new Error(
                            "Errore nella risposta dal server: " + response.statusText
                        );
                    }
                } catch (error) {
                    console.error("Errore nel recupero dei dati utente:", error);
                    setError(error.message);
                    setIsLoggedIn(false);
                    setUserData(null);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [setIsLoggedIn, setUserData]);

    return { isLoading, setIsLoggedIn, setUserData, error }; // Include error in the returned object
};

