import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Alert, Table, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import it from "date-fns/locale/it";
import "../styles/Profile.css";
function Profile() {
    // 1. Utilizzo del Context e State
    const { isAuthenticated, token } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null); // Stato per i dati del profilo utente
    const [isLoading, setIsLoading] = useState(true); // Stato per indicare se i dati sono in caricamento
    const [error, setError] = useState(null); // Stato per gestire eventuali errori
    const navigate = useNavigate(); // Hook per la navigazione

    // 2. Effetto per il caricamento dei dati del profilo
    useEffect(() => {
        // Verifica se l'utente è autenticato
        if (!isAuthenticated) {
            navigate("/"); // Se non autenticato, reindirizza alla home
            return; // Interrompi l'esecuzione dell'effetto
        }

        // Funzione asincrona per recuperare i dati del profilo
        const fetchProfileData = async () => {
            setIsLoading(true); // Imposta lo stato di caricamento a true

            try {
                // Se è presente un token, effettua la richiesta al backend
                if (token) {
                    const response = await fetch("http://localhost:3001/auth/profile", {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    // Se la richiesta ha avuto successo, aggiorna lo stato con i dati del profilo
                    if (response.ok) {
                        const data = await response.json();
                        setProfileData(data);
                    } else {
                        setError("Errore nel recupero dei dati del profilo.");
                    }
                }
            } catch (error) {
                // Gestione degli errori durante la richiesta
                setError("Errore durante la richiesta: " + error.message);
            } finally {
                setIsLoading(false); // Imposta lo stato di caricamento a false, indipendentemente dal risultato
            }
        };

        // Chiama la funzione per recuperare i dati
        fetchProfileData();
    }, [isAuthenticated, token, navigate]); // Eseguito solo quando cambia isAuthenticated o token

    // 3. Funzione per gestire la cancellazione di un appuntamento
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
                // Aggiorna lo stato del profilo rimuovendo l'appuntamento cancellato
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

    // 4. Rendering del componente
    return (
        <div className="container mt-5 w-100 d-flex justify-content-center">
            {/* Se c'è un errore, mostra un alert */}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Se sta caricando, mostra uno spinner */}
            {isLoading ? (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Caricamento...</span>
                    </Spinner>
                </div>
            ) : profileData ? (
                // Se ci sono dati del profilo, mostra la sezione appuntamenti
                <div className="text-center profile-container">
                    <section className="mt-4 appointment-box">
                        {/* Titolo della sezione */}
                        <h2>
                            Appuntamenti di {profileData.name} {profileData.surname}{" "}
                        </h2>
                        {/* Verifica se ci sono appuntamenti */}
                        {profileData && profileData.appointments && profileData.appointments.length === 0 ? (
                            <p>Non hai ancora prenotato nessun appuntamento.</p>
                        ) : (
                            // Se ci sono appuntamenti, mostra una tabella
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
                                    {/* Corpo della tabella - itera sugli appuntamenti e formatta la data */}
                                    {profileData?.appointments?.map((appointment) => {
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
                                                <td>{/* Bottone per cancellare l'appuntamento */}
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
                        {/* Bottone per prenotare un nuovo appuntamento */}
                        <Button variant="outline-dark" className="mb-4" onClick={() => navigate("/")}>
                            Prenota un nuovo appuntamento
                        </Button>
                    </section>
                </div>
            ) : null} {/* Se non ci sono dati del profilo, non mostrare nulla */}
        </div>
    );
}

export default Profile;
