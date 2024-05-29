import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Alert, Table, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import it from "date-fns/locale/it";

function Profile() {
    const { isAuthenticated, user, token } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(user); // Inizializza con i dati dell'utente dal contesto
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            try {
                if (token) {
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

        if (!profileData || !profileData.appointments) { // Controlla se profileData e i suoi appuntamenti sono stati caricati
            fetchProfileData();
        } else {
            setIsLoading(false); // Se i dati sono già presenti nel context, non è necessario ricaricarli
        }
    }, [token, profileData]);

    const handleCancelAppointment = async (appointmentId) => {
        try {
            const response = await fetch(`http://localhost:3001/appointment/${appointmentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                // Aggiorna lo stato locale rimuovendo l'appuntamento cancellato
                setProfileData(prevData => ({
                    ...prevData,
                    appointments: prevData.appointments.filter(app => app._id !== appointmentId)
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
            {error && <Alert variant="danger">{error}</Alert>}
            {isLoading ? (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Caricamento...</span>
                    </Spinner>
                </div>
            ) : profileData ? (
                <div>
                    <h1>Profilo di {profileData.name} {profileData.surname}</h1>
                    <p>Email: {profileData.email}</p>

                    <section className="mt-4">
                        <h2>I miei appuntamenti</h2>
                        {profileData.appointments.length === 0 ? (
                            <p>Non hai ancora prenotato nessun appuntamento.</p>
                        ) : (
                            <Table striped bordered hover responsive>
                                <thead>
                                    {/* ... intestazione della tabella ... */}
                                </thead>
                                <tbody>
                                    {profileData.appointments.map((appointment) => (
                                        <tr key={appointment._id}>
                                            <td>{appointment.serviceType.title}</td>
                                            <td>{format(new Date(appointment.date), 'dd/MM/yyyy HH:mm', { locale: it })}</td>
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
                        {/* ... pulsante per prenotare ... */}
                    </section>
                </div>
            ) : null}
        </div>
    );
}

export default Profile;