import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../../styles/Registration.css';
function RegistrationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    dataDiNascita: '',
    avatar: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      const data = await response.json();
      const token = data.token;
      localStorage.setItem('token', token);

      console.log('Registration successful!');
      navigate('/login');
    } catch (err) {
      setErrors({ general: err.message || 'An error occurred' });
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <div className="registration-form">
            <h2 className="text-center mb-4">Registrati</h2>
            {errors.general && <Alert variant="danger">{errors.general}</Alert>}

            <Form onSubmit={handleSubmit}>
              {/* Nome */}
              <Form.Group controlId="name">
                <Form.Label>Nome</Form.Label>
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
              <Form.Group controlId="surname"><Form.Label>Cognome</Form.Label>
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
                <Form.Label>Username</Form.Label>
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
                <Form.Label>Email</Form.Label>
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
                <Form.Label>Password</Form.Label>
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
                <Form.Label>Data di nascita</Form.Label>
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
                <Form.Label>Avatar (URL)</Form.Label>
                <Form.Control
                  type="text"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                />
              </Form.Group>

              <Button type="submit" variant="outline-dark" className="my-3">
                Registrati
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container >
  );
}

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
