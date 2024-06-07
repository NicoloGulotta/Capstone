import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/Registration.css";

function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    password: "",
    dataDiNascita: "",
    avatar: "",
  });

  // Initialize errors as an empty object
  const [errors, setErrors] = useState({});

  const { login, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await fetch("http://localhost:3001/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.token);
          login(data);
          navigate("/");
        } else {
          const errorData = await response.json();
          // Set a generic error message if the backend doesn't provide a specific one
          setError(errorData.message || "Registration failed. Please try again.");
        }
      } catch (err) {
        console.error("Error during registration request:", err.message);
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
