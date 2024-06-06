import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, InputGroup, FormControl, Modal, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { useFetchUserData } from '../data/useFetchUserData';
import { AuthContext } from '../context/AuthContext';

function Settings() {
    const { user, isLoading, error, setIsLoading, setError, refetchUserData } = useFetchUserData();
    const API_BASE_URL = "http://localhost:3001/auth";
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    // Funzione per aggiornare i dati dell'utente (integrata nel componente)
    const updateUser = async (formData) => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser && storedUser.token) {
            const response = await fetch(`${API_BASE_URL}/settings`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${storedUser.token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                return response.json();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Errore durante l'aggiornamento del profilo");
            }
        } else {
            throw new Error("Utente non autenticato");
        }
    };

    // Funzione per eliminare l'account dell'utente (integrata nel componente)
    const deleteUser = async () => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        console.log(storedUser);
        console.log(storedToken);
        if (storedUser && storedToken) {
            const response = await fetch(`${API_BASE_URL}/delete-account`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${storedToken}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Errore durante la cancellazione dell'account");
            }
        } else {
            throw new Error("Utente non autenticato"); // Lancia un errore esplicito
        }
    };
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                surname: user.surname || "",
                email: user.email || "",
                password: "",
                confirmPassword: "",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Verifica se la password è stata modificata
            if (formData.password && formData.password === formData.confirmPassword) {
                await updateUser(formData);
            } else if (formData.password || formData.confirmPassword) {
                throw new Error('Le password non corrispondono o un campo è vuoto.');
            } else {
                // Aggiorna solo i dati senza password
                await updateUser({ name: formData.name, surname: formData.surname, email: formData.email });
            }

            await refetchUserData();
            setSuccess('Profilo aggiornato con successo!');
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            setError(error.message || 'Errore durante l\'aggiornamento del profilo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm('Sei sicuro di voler cancellare il tuo account? Questa azione è irreversibile.');
        if (confirmDelete) {
            try {
                setIsLoading(true);
                await deleteUser(); // Chiama la funzione deleteUser
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
        );
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

                    <Form.Group controlId="formEmail" className='mb-3'>
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </Form.Group>

                    {/* Password Fields (with show/hide functionality) */}
                    <InputGroup >
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

                    {/* Delete Account Button */}
                    <Button variant="danger" className="m-3" onClick={handleShowModal}>
                        <FontAwesomeIcon icon={faTrashAlt} className="me-2" /> Cancella Account
                    </Button>
                </Form>
            </div>

            {/* Delete Account Modal */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Conferma Cancellazione Account</Modal.Title>
                </Modal.Header>
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