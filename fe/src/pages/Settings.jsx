import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, InputGroup, FormControl, Modal, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { useFetchUserData } from '../data/useFetchUserData';
import { AuthContext } from '../context/AuthContext';

function Settings() {
    // Ottiene dati e funzioni dal custom hook useFetchUserData
    const { user, isLoading, error, updateUser, deleteUser, refetchUserData, setIsLoading, setError } = useFetchUserData();

    // Stati locali per gestire il form, messaggi e visualizzazione password
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Hook per la navigazione
    const navigate = useNavigate();

    // Ottiene funzioni di autenticazione dal contesto
    const { isAuthenticated } = useContext(AuthContext);
    const { logout } = useContext(AuthContext);

    // Effetto per inizializzare il form con i dati utente
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                surname: user.surname || "",
                email: user.email || "",
                password: "", // Start with empty password fields
                confirmPassword: "",
            });
        }
    }, [user]);// Dipende da user per rieseguire se cambia

    // Gestisce i cambiamenti nei campi del form
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Gestisce l'invio del form
    const handleSubmit = async (e) => {
        e.preventDefault(); // Previene il refresh della pagina
        setIsLoading(true); // Imposta lo stato di caricamento
        setError(null); // Pulisce eventuali errori precedenti
        setSuccess(false); // Pulisce eventuali messaggi di successo precedenti

        try {
            await updateUser(formData); // Aggiorna i dati utente
            await refetchUserData(); // Ricarica i dati utente aggiornati
            setSuccess('Profilo aggiornato con successo!'); // Imposta il messaggio di successo
            setTimeout(() => {
                setSuccess(false); // Nasconde il messaggio di successo dopo 3 secondi
            }, 3000);
        } catch (error) {
            setError(error.message || 'Errore durante l\'aggiornamento del profilo.'); // Gestisce gli errori
        } finally {
            setIsLoading(false); // Reimposta lo stato di caricamento
        }
    };

    // Gestisce l'eliminazione dell'account
    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm('Sei sicuro di voler cancellare il tuo account? Questa azione è irreversibile.');
        if (confirmDelete && isAuthenticated) {
            try {
                setIsLoading(true);
                await deleteUser(); // Elimina l'account
                logout(); // Effettua il logout
                navigate('/'); // Reindirizza alla home
            } catch (error) {
                setError(error.message || 'Errore durante la cancellazione dell\'account.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Funzioni per mostrare/nascondere le password
    const toggleShowPassword = () => setShowPassword(!showPassword);
    const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    // Funzioni per gestire la finestra modale di conferma eliminazione
    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);

    // Conditional Rendering
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        ); // Show loading indicator while fetching user data
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>; // Show error message if there's an error
    }
    return (
        <div>
            <div className="container mt-5">
                <h2>Impostazioni Profilo</h2>
                {success && <Alert variant="success">{success}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formName">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group controlId="formSurname">
                        <Form.Label>Cognome</Form.Label>
                        <Form.Control type="text" name="surname" value={formData.surname} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group controlId="formEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </Form.Group>

                    {/* Password Fields (with show/hide functionality) */}
                    <InputGroup className="mb-3">
                        <FormControl
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Nuova password"
                        />
                        <Button variant="outline-secondary" onClick={toggleShowPassword}>
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </Button>
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <FormControl
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Conferma password"
                        />
                        <Button variant="outline-secondary" onClick={toggleShowConfirmPassword}>
                            <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                        </Button>
                    </InputGroup>

                    <Button variant="outline-dark" type="submit" disabled={isLoading}>
                        {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
                    </Button>
                </Form>

                {/* Delete Account Button */}
                <Button variant="danger" className="my-3" onClick={handleShowModal}>
                    <FontAwesomeIcon icon={faTrashAlt} className="me-2" /> Cancella Account
                </Button>
            </div>

            {/* Delete Account Modal */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Conferma Cancellazione Account</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Sei sicuro di voler cancellare il tuo account? Questa azione è irreversibile.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Annulla
                    </Button>
                    <Button variant="danger" onClick={handleDeleteAccount} disabled={isLoading}>
                        {isLoading ? 'Cancellazione...' : 'Conferma Cancellazione'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}


export default Settings;