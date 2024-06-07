import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/Registration.css"; // Importa il CSS personalizzato

function RegistrationForm() {
  // Stato per gestire i dati del form
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    password: "",
    dataDiNascita: "",
    avatar: "",
  });

  // Stato per gestire eventuali errori di validazione
  const [errors, setErrors] = useState({});

  const { login, error, setError } = useContext(AuthContext);
  // Hook per la navigazione
  const navigate = useNavigate();

  // Funzione per gestire le modifiche nei campi del form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Funzione per gestire l'invio del form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null); // Resetta eventuali errori precedenti

    // Esempio di validazione (aggiungi la tua logica di validazione qui)
    const newErrors = {};
    if (!formData.email.includes("@")) {
      newErrors.email = "Inserisci una email valida";
    }
    if (formData.password.length < 6) {
      newErrors.password = "La password deve essere di almeno 6 caratteri";
    }
    setError(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Se non ci sono errori, invia i dati al backend per la registrazione
      try {
        const response = await fetch("http://localhost:3001/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.token); // Salva il token nel localStorage
          login(data); // Aggiorna il contesto di autenticazione
          navigate("/"); // Reindirizza alla home page
        } else {
          // Login fallito
          const errorData = await response.json();
          setError(errorData.message || "Login failed. Check your credentials.");
        }
      } catch (err) {
        // Errore di rete o del server
        console.error("Error during login request:", err.message);
        setError("Network or server error. Please try again later.");
      }
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Form className="registration-form p-3 rounded bg-dark" onSubmit={handleSubmit} >
            <h2 className="text-center mb-4 text-white">Registrati</h2>
            {errors.general && <Alert variant="danger">{errors.general}</Alert>}

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


            {/* Cognome */}
            <Form.Group controlId="surname"><Form.Label className="text-white">Cognome</Form.Label>
              <Form.Control
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                isInvalid={!!errors.surname}
              />
              <Form.Control.Feedback type="invalid">{errors.surname}</Form.Control.Feedback>
            </Form.Group>

            {/* Username */}
            <Form.Group controlId="username">
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

            {/* Email */}
            <Form.Group controlId="email">
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

            {/* Password */}
            <Form.Group controlId="password">
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

            {/* Data di Nascita */}
            <Form.Group controlId="dataDiNascita">
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

            {/* Avatar (opzionale) */}
            <Form.Group controlId="avatar">
              <Form.Label className="text-white">Avatar (URL)</Form.Label>
              <Form.Control
                type="text"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
              />
            </Form.Group>
            <div className="d-grid gap-2">
              <Button variant="outline-light" type="submit" className="my-3">
                Registrati
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

function validateForm(data) {
  const errors = {};
  if (!data.name.trim()) errors.name = 'Il nome è richiesto';
  if (!data.surname.trim()) errors.surname = 'Il cognome è richiesto';
  if (!data.username.trim()) errors.username = "L'username è richiesto";
  if (!data.email.trim()) errors.email = "L'email è richiesta";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Formato email non valido';
  if (!data.password.trim()) errors.password = 'La password è richiesta';
  if (data.password.length < 8) errors.password = 'La password deve essere di almeno 8 caratteri';
  if (!data.dataDiNascita.trim()) errors.dataDiNascita = 'La data di nascita è richiesta';
  return errors;
}

export default RegistrationForm;
