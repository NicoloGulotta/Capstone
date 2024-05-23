import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
function Profile() {
    const { isAuthenticated } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            try {
                if (isAuthenticated) {
                    const response = await fetch(
                        `http://localhost:3001/auth/profile`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        console.log(data);
                        setProfileData(data);
                    } else {
                        setError("Errore nel recupero dei dati del profilo.");
                    }
                }
            } catch (error) {
                setError("Errore durante la richiesta: " + error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [isAuthenticated]);

    return (
        <div>
            {error && <Alert variant="danger">{error}</Alert>}
            {isLoading ? (
                <p>Caricamento dati del profilo...</p>
            ) : profileData ? (
                <div>
                    <h1>Profilo di {profileData.name} {profileData.surname}</h1>
                    <p>Email: {profileData.email}</p>
                    <p>Commenti: {profileData.comments}</p>
                    {/* <p>Ruolo: {profileData.role}</p> */}
                    <p>Appuntamenti: {profileData.appointments}</p>
                </div>
            ) : (
                <Alert>Stai per uscire da ScisorHand</Alert>
                , navigate("/")
            )}
        </div>
    );
}
export default Profile;