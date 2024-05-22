import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import '../../styles/Registration.css';
import { useNavigate } from 'react-router-dom';

const RegistrationForm = () => {
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
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate form fields
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Il nome è richiesto';
    if (!formData.surname.trim()) errors.surname = 'Il cognome è richiesto';
    if (!formData.username.trim()) errors.username = "L'username è richiesto";
    if (!formData.email.trim()) errors.email = "L'email è richiesta";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Formato email non valido';
    if (!formData.password.trim()) errors.password = 'La password è richiesta';
    if (formData.password.length < 8) errors.password = 'La password deve essere di almeno 8 caratteri';
    if (!formData.dataDiNascita.trim()) errors.dataDiNascita = 'La data di nascita è richiesta';

    if (Object.keys(errors).length > 0) {
      setError(errors);
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
      const data = await response.json(); // Get data from response
      const token = data.token; // Extract token from data (adjust if your API response structure is different)
      localStorage.setItem('token', token); // Store the token

      // Successful registration
      console.log('Registration successful!');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 mt-5">
      <div className="p-3 rounded bg-black w-25 text-white">
        <h2>Registration</h2>
        {error && <Error error={error} />}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="name">
            <Form.Label>Nome</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} />
          </Form.Group>

          <Form.Group controlId="surname">
            <Form.Label>Cognome</Form.Label>
            <Form.Control type="text" name="surname" value={formData.surname} onChange={handleChange} />
          </Form.Group>

          <Form.Group controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" name="username" value={formData.username} onChange={handleChange} />
          </Form.Group>

          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
          </Form.Group>

          <Form.Group controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} />
          </Form.Group>

          <Form.Group controlId="dataDiNascita">
            <Form.Label>Data di nascita</Form.Label>
            <Form.Control type="date" name="dataDiNascita" value={formData.dataDiNascita} onChange={handleChange} />
          </Form.Group>

          <Form.Group controlId="avatar">
            <Form.Label>Avatar (URL)</Form.Label>
            <Form.Control type="text" name="avatar" value={formData.avatar} onChange={handleChange} />
          </Form.Group>

          <Button type="submit" className="btn m-2 d-flex btn-primary align-items-center justify-content-center">
            Registrati
          </Button>
        </Form>
      </div>
    </div>
  );
};

const Error = ({ error }) => {
  if (!error) return null;

  return (
    <p className="text-danger">
      {Object.keys(error).map((key) => (
        <span key={key}>{error[key]}</span>
      ))}
    </p>
  );
};
export default RegistrationForm;