import React, { useState, useContext } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import AuthContext from "../../context/AuthContext";
import { useNavigate } from 'react-router-dom';

const RegistrationForm = () => {
  const { login } = useContext(AuthContext); // Ottieni login dal contesto
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    birthday: "",
    avatar: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        login(data); // Aggiorna il contesto di autenticazione
        navigate('/profile');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 mt-5">
      <div className="p-3 rounded bg-black w-25 text-white">
        <h2>Registration</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          {/* ... (campi del form con onChange={handleChange} e name corretto per ogni input) ... */}
          <Button type="submit" className="btn m-2 d-flex btn-primary align-items-center justify-content-center">
            Registrati
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default RegistrationForm;
