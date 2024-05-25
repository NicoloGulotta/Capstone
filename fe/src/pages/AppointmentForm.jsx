import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import { formatISO } from 'date-fns';
import { AuthContext } from '../context/AuthContext'; // Assicurati di importare il tuo contesto
import { parse, format } from 'date-fns';
import it from 'date-fns/locale/it';




function AppointmentForm({ postId }) {
    const { user } = useContext(AuthContext); // Ottieni i dati dell'utente dal contesto
    //console.log(user);
    // Orario minimo (09:00)
    const minTime = parse("09:00", "HH:mm", new Date());

    // Orario massimo (20:00)
    const maxTime = parse("20:00", "HH:mm", new Date());
    const [formData, setFormData] = useState({
        date: new Date(),
        notes: '',
        status: 'In attesa',
        serviceType: postId,
        user: user ? user._id : null, // Imposta l'ID utente se disponibile
    });

    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState('danger');

    useEffect(() => {
        // Aggiorna l'ID utente nello stato se cambia nel contesto
        if (user) {
            setFormData(prevData => ({ ...prevData, user: user._id }));
        }
    }, [user]); // Dipendenza dal contesto user

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDateChange = (date) => {
        setFormData({ ...formData, date });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            setAlertMessage('Non sei autenticato. Effettua il login per creare un appuntamento.');
            setShowAlert(true);
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/appointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    date: format(formData.date, 'yyyy-MM-dd'),
                    serviceType: postId,
                    user: user._id,
                }),
            });
            console.log(formData);

            if (response.ok) {
                setAlertMessage('Appuntamento creato con successo!');
                setAlertVariant('success');
                setShowAlert(true);
                setFormData({
                    ...formData,
                    serviceType: postId,
                    user: user ? user._id : null, // Reimposta l'ID utente se disponibile
                });
            } else {
                const errorData = await response.json();
                setAlertMessage(`Errore durante la creazione dell'appuntamento: ${errorData.message || response.statusText}`);
                setShowAlert(true);
            }
        } catch (error) {
            setAlertMessage(`Errore imprevisto: ${error.message}`);
            setShowAlert(true);
        }
    };

    return (
        <>
            {showAlert && (
                <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>
                    {alertMessage}
                </Alert>
            )}

            <Form onSubmit={handleSubmit}>  <Form.Group controlId="date" className="mt-4">
                <Form.Label className="me-2">Data e ora:</Form.Label><DatePicker
                    selected={formData.date}
                    onChange={handleDateChange}
                    showTimeSelect
                    dateFormat="dd/MM/yyyy HH:mm"
                    timeIntervals={30}
                    minTime={minTime}
                    maxTime={maxTime}
                    locale={it}
                />
            </Form.Group>

                <Form.Group controlId="notes">
                    <Form.Label className='me-2'>Note:</Form.Label>
                    <Form.Control as="textarea" name="notes" value={formData.notes} onChange={handleChange} />
                </Form.Group>

                <Button variant="primary" type="submit" className='m-4'>
                    Prenota
                </Button>
            </Form>
        </>
    );
}

export default AppointmentForm;
