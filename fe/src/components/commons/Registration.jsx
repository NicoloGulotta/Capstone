import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/Registration.css";
function RegistrationForm() {
  // State to manage form data
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    password: "",
    dataDiNascita: "",
  });

  // State to manage errors for each form field (initially empty)
  const [errors, setErrors] = useState({});

  // Access functions from the AuthContext
  const { login, setError, isAuthenticated } = useContext(AuthContext);

  // Hook for navigation (redirecting after successful registration)
  const navigate = useNavigate();

  // Function to update form data when input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to handle form submission  
  const Handlesubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    // If validation passes, proceed with registration
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await fetch("http://localhost:3001/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        // Handle successful registration
        if (response.ok) {
          const data = await response.json();
          console.log("Registration successful:", data);
          login(data); // Pass the entire user object
          isAuthenticated(true);
          navigate("/"); // 
        } else {
          // Handle registration errors from the backend
          const errorData = await response.json();
          setError(errorData.message || "Registration failed. Please try again.");
        }
      } catch (err) {
        // Handle network or server errors
        console.error("Error during registration:", err.message);
        setError("Network or server error. Please try again later.");
      }
    }
  };
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile");
    }
  }, [isAuthenticated, navigate]);
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Form className="registration-form p-3 rounded bg-dark" onSubmit={Handlesubmit}>
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

            {/* Pulsante di registrazione */}
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


  // Function to validate form data
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
}
export default RegistrationForm;
