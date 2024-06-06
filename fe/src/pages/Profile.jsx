import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Alert, Table, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import it from "date-fns/locale/it";

function Profile() {
    const { isAuthenticated, token } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check authentication and redirect
        if (!isAuthenticated) {
            navigate("/");
            return;
        }

        const fetchProfileData = async () => {
            setIsLoading(true);

            try {
                if (token) {
                    const response = await fetch("http://localhost:3001/auth/profile", {
                        headers: { Authorization: `Bearer ${token}` },
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

        fetchProfileData();
    }, [isAuthenticated, token, navigate]);

    const handleCancelAppointment = async (appointmentId) => {
        try {
            const response = await fetch(
                `http://localhost:3001/appointment/${appointmentId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                setProfileData((prevData) => ({
                    ...prevData,
                    appointments: prevData.appointments.filter(
                        (app) => app._id !== appointmentId
                    ),
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
                    <h1>
                        Profilo di {profileData.name} {profileData.surname}
                    </h1>
                    <p>Email: {profileData.email}</p>
                    {/* Sezione appuntamenti */}
                    <section className="mt-4">
                        <h2>I miei appuntamenti</h2>
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
                                    {profileData.appointments.map((appointment) => {
                                        let formattedDateTime = "Data e ora non disponibili";
                                        if (appointment.date) {
                                            formattedDateTime = format(parseISO(appointment.date), "PPPPp", {
                                                locale: it,
                                            });
                                        }
                                        return (
                                            <tr key={appointment._id}>
                                                <td>{appointment.serviceType.title}</td>
                                                <td>{formattedDateTime}</td>
                                                <td>{appointment.notes || "Nessuna nota"}</td>
                                                <td>{appointment.status}</td>
                                                <td>
                                                    <Button
                                                        variant="danger"
                                                        onClick={() => handleCancelAppointment(appointment._id)}
                                                    >
                                                        X
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        )}
                        <Button
                            variant="primary"
                            className="mb-3"
                            onClick={() => navigate("/book-appointment")}
                        >
                            Prenota un nuovo appuntamento
                        </Button>
                    </section>
                </div>
            ) : null}
        </div>
    );
}

export default Profile;
