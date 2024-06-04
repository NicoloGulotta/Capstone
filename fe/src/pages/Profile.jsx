import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext"; // Importa AuthContext
import { Alert, Table, Button, Spinner } from "react-bootstrap"; // Importa componenti Bootstrap
import { useNavigate } from "react-router-dom"; // Importa useNavigate per la navigazione
import { format } from "date-fns"; // Importa date-fns per la formattazione della data
import it from "date-fns/locale/it"; // Importa locale italiano per la formattazione della data

function Profile() {
    // Recupera isAuthenticated e token da AuthContext
    const { isAuthenticated, token } = useContext(AuthContext);

    // Stato per i dati del profilo, stato di caricamento e messaggio di errore
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hook useNavigate per la navigazione
    const navigate = useNavigate();

    // useEffect per recuperare i dati del profilo al caricamento del componente o al cambio del token
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/"); // Reindirizza al login se non autenticato
            return;
        }

        const fetchProfileData = async () => {
            setIsLoading(true); // Imposta lo stato di caricamento su true

            try {
                if (token) {
                    // Recupera i dati del profilo usando il token e imposta lo stato di caricamento su false
                    const response = await fetch("http://localhost:3001/auth/profile", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
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

        fetchProfileData(); // Chiama la funzione fetchProfileData
    }, [isAuthenticated, token]); // Dipende da isAuthenticated e token

    // Funzione per gestire l'annullamento di un appuntamento
    const handleCancelAppointment = async (appointmentId) => {
        try {
            const response = await fetch(`http://localhost:3001/appointment/${appointmentId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                // Aggiorna profileData con l'array degli appuntamenti aggiornato
                setProfileData((prevData) => ({
                    ...prevData,
                    appointments: prevData.appointments.filter((app) => app._id !== appointmentId),
                }));
                console.log("Appuntamento eliminato correttamente");
            } else {
                setError("Errore durante l'eliminazione dell'appuntamento.");
            }
        } catch (error) {
            setError("Errore imprevisto: " + error.message);
        }
    };
    return (
        <div className="container mt-5">
            {/* Visualizza messaggio di errore se presente */}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Visualizza spinner di caricamento */}
            {isLoading ? (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Caricamento...</span>
                    </Spinner>
                </div>
            ) : profileData ? (
                <div>
                    {/* Visualizza informazioni del profilo */}
                    <h1>Profilo di {profileData.name} {profileData.surname}</h1>
                    <p>Email: {profileData.email}</p>

                    {/* Sezione appuntamenti */}
                    <section className="mt-4">
                        <h2>I miei appuntamenti</h2>

                        {/* Messaggio se non ci sono appuntamenti */}
                        {profileData.appointments.length === 0 ? (
                            <p>Non hai ancora prenotato nessun appuntamento.</p>
                        ) : (
                            <Table striped bordered hover responsive>
                                <thead>
                                    {/* Intestazione della tabella */}
                                    <tr>
                                        <th>Servizio</th>
                                        <th>Data e Ora</th>
                                        <th>Note</th>
                                        <th>Stato</th>
                                        <th>Azioni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Mappa gli appuntamenti e visualizza ciascuno in una riga della tabella */}
                                    {profileData.appointments.map((appointment) => (
                                        <tr key={appointment._id}>
                                            {typeof appointment.date === 'string'
                                                ? new Date(appointment.date) // Parse if string
                                                : appointment.date}
                                            <td>{appointment.serviceType.title}</td>
                                            <td>{format(appointment.date, 'dd/MM/yyyy HH:mm', { locale: it })}</td>
                                            <td>{appointment.notes || "Nessuna nota"}</td>
                                            <td>{appointment.status}</td>
                                            <td>
                                                <Button variant="danger" onClick={() => handleCancelAppointment(appointment._id)}>
                                                    Annulla
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}

                        {/* Pulsante per prenotare un nuovo appuntamento */}
                        <Button variant="primary" className="mb-3" onClick={() => navigate("/book-appointment")}>
                            Prenota un nuovo appuntamento
                        </Button>
                    </section>
                </div>
            ) : null}
        </div>
    );
}
export default Profile;      