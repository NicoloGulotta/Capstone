import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function Profile() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get('accessToken');

    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('http://localhost:3001/auth/profile', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                } else {
                    console.error('Errore nel recupero dei dati dell\'utente:', response.statusText);
                }
            } catch (error) {
                console.error('Errore durante la richiesta:', error);
            }
        };

        if (accessToken) {
            fetchUserData();
        }
    }, [accessToken]);

    return (
        <div>
            <h1>Profilo Utente</h1>
            {userData ? (
                <div>
                    {userData.avatar && <img src={userData.avatar} alt="Avatar" />}
                    <p>Nome e Cognome: {userData.name} {userData.surname}</p>
                    <p>Email: {userData.email}</p>
                </div>
            ) : (
                <p>Caricamento dati utente...</p>
            )}
        </div>
    );
}

export default Profile;
