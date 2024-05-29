import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Alert, Table, Button, Spinner } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import it from "date-fns/locale/it";

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
                    const response = await fetch("http://localhost:3001/auth/profile", {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();

                        // Se ci sono appuntamenti, recupera i dettagli
                        if (data.appointments && data.appointments.length > 0) {
                            const appointmentDetailsPromises = data.appointments.map(async (appointmentId) => {
                                const res = await fetch(`http://localhost:3001/appointment/${appointmentId}`, {
                                    headers: {
                                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                                    },
                                });
                                return res.json();

                            });

                            const appointmentDetails = await Promise.all(appointmentDetailsPromises);
                            setProfileData({ ...data, appointments: appointmentDetails });
                            console.log(appointmentDetails);
                        } else {
                            // Se non ci sono appuntamenti, imposta profileData direttamente
                            setProfileData(data);
                        }
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

    const handleCancelAppointment = async (appointmentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/appointment/${appointmentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
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
                        {profileData.appointments?.length === 0 ? (
                            <p>Non hai ancora prenotato nessun appuntamento.</p>
                        ) : (
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th key="service">Servizio</th>
                                        <th key="date">Data e Ora</th>
                                        <th key="notes">Note</th>
                                        <th key="status">Stato</th>
                                        <th key="actions">Azioni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profileData.appointments?.map((appointment) => (
                                        <tr key={appointment._id}>
                                            <td>{appointment.serviceType || "Servizio non disponibile"}</td>
                                            <td>{appointment.date ? format(new Date(appointment.date), 'dd/MM/yyyy HH:mm', { locale: it }) : "Data non disponibile"}</td>
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
                        <Link to="/services">
                            <Button variant="primary">Prenota un nuovo appuntamento</Button>
                        </Link>
                    </section>
                </div>
            ) : (
                <>
                    <Alert variant="warning">Stai per uscire da ScisorHand</Alert>
                    {navigate("/")}
                </>
            )}
        </div>
    );
}

export default Profile;
