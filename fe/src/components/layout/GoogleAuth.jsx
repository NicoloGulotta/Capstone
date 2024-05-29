import React, { useContext, useEffect, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

function GoogleAuth() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate(); // Inizializza useNavigate
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleAuth = () => {
        setIsLoading(true);
        window.open("http://localhost:3001/auth/googlelogin", "_self");
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userString = urlParams.get('user');

        if (token && userString) {
            const user = JSON.parse(decodeURIComponent(userString));
            login({ ...user, token });
            navigate('/'); // Reindirizza alla home dopo il login
        }
    }, [login, navigate]); // Aggiungi navigate alle dipendenze

    return (
        <>
            <Button className="bg-dark m-3" onClick={handleGoogleAuth} disabled={isLoading}>
                {isLoading ? <Spinner animation="border" size="sm" /> : 'Accedi con Google'}
            </Button>
        </>
    );
}

export default GoogleAuth;
