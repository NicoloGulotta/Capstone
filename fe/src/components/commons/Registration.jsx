import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import CustomAlert from "../Alert";
import "../../styles/Registration.css";

function RegistrationForm() {
  // 1. Stato per gestire i dati del modulo
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    password: "",
    dataDiNascita: "", // Assicurati che il nome del campo corrisponda al backend
  });

  // 2. Stato per gestire gli errori di validazione
  const [errors, setErrors] = useState({});

  // 3. Stato per gestire la visualizzazione dell'alert
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({ type: '', message: '' });

  // 4. Accesso al contesto di autenticazione e navigazione
  const { login, setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // 5. Funzione per gestire le modifiche ai campi del form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 6. Funzione per gestire l'invio del form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 6.1 Validazione dei dati del form
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    // 6.2 Se non ci sono errori di validazione, procedi con la registrazione
    if (Object.keys(validationErrors).length === 0) {
      try {
        // 6.2.1 Invia la richiesta di registrazione al server
        const response = await fetch("http://localhost:3001/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        // 6.2.2 Gestione della risposta del server
        if (response.ok) {
          const data = await response.json();

          // 6.2.2.1 Registrazione avvenuta con successo
          setShowAlert(true);
          setAlertData({ type: 'success', message: data.message || "Registrazione avvenuta con successo! Effettua il login!" });
          localStorage.setItem("token", data.token); // Memorizza il token

          // Aggiorna il contesto di autenticazione e reindirizza dopo 1.5 secondi
          login(data);
          setIsAuthenticated(true);
          setTimeout(() => navigate("/login"), 1500);
        } else {
          // 6.2.2.2 Registrazione fallita (errore lato server)
          const errorData = await response.json();
          setShowAlert(true);
          setAlertData({ type: 'danger', message: errorData.message || "Registrazione fallita. Riprova più tardi." });
        }
      } catch (err) {
        // 6.2.3 Gestione degli errori di rete
        console.error("Errore durante la registrazione:", err.message);
        setShowAlert(true);
        setAlertData({ type: 'danger', message: "Errore di rete o del server. Riprova più tardi." });
      }
    }
  };

  //7. Function to validate form data
  function validateForm(data) {
    const errors = {};
    if (!data.name.trim()) errors.name = "Il nome è richiesto";
    if (!data.surname.trim()) errors.surname = "Il cognome è richiesto";
    if (!data.username.trim()) errors.username = "L'username è richiesto";
    if (!data.email.trim()) errors.email = "L'email è richiesta";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errors.email = "Formato email non valido";
    if (!data.password.trim()) errors.password = "La password è richiesta";
    if (data.password.length < 8)
      errors.password = "La password deve essere di almeno 8 caratteri";
    if (!data.dataDiNascita.trim())
      errors.dataDiNascita = "La data di nascita è richiesta";
    return errors;
  }

  // 8. Rendering del componente JSX
  return (
    <Container className="my-4">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          {showAlert && <CustomAlert {...alertData} />}

          <Form className="registration-form p-3 rounded bg-dark" onSubmit={handleSubmit}>
            <h2 className="text-center mb-4 text-white">Registrati</h2>

            {/* Campi del form */}
            <Form.Group controlId="name" className="mb-3">
              <Form.Label className="text-white">Nome</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="surname" className="mb-3">
              <Form.Label className="text-white">Cognome</Form.Label>
              <Form.Control
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                isInvalid={!!errors.surname}
              />
              <Form.Control.Feedback type="invalid">{errors.surname}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="username" className="mb-3">
              <Form.Label className="text-white">Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                isInvalid={!!errors.username}
              />
              <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="email" className="mb-3">
              <Form.Label className="text-white">Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="password" className="mb-3">
              <Form.Label className="text-white">Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="dataDiNascita" className="mb-3">
              <Form.Label className="text-white">Data di nascita</Form.Label>
              <Form.Control
                type="date"
                name="dataDiNascita"
                value={formData.dataDiNascita}
                onChange={handleChange}
                isInvalid={!!errors.dataDiNascita}
              />
              <Form.Control.Feedback type="invalid">{errors.dataDiNascita}</Form.Control.Feedback>
            </Form.Group>
            <Button variant="outline-light" type="submit" className="w-100">
              Registrati
            </Button>

            <p className="mt-2 text-center text-white">Hai un account?</p>
            <div className="d-grid gap-2">
              <Link to="/login" className="btn btn-outline-light">
                Accedi
              </Link>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default RegistrationForm;