import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Alert, Table, Button, Spinner } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import it from "date-fns/locale/it";

function Profile() {
    const { isAuthenticated, token: contextToken } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(contextToken);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    // Verifica la presenza del token nel localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

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
                        setProfileData(data); // Imposta direttamente i dati del profilo con gli appuntamenti già popolati
                        // data.appointments.forEach(appointment => {
                        //     console.log(appointment.serviceType);
                        // })
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
    }, [token]);

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
                    {/* ... spinner ... */}
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