import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import immagineHero from '../assets/images/hero.jpg';
import '../styles/Home.css';
import 'bootstrap/dist/css/bootstrap.min.css';
function Servizi() {
  const [servizi, setServizi] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/post/');
        if (!response.ok) {
          throw new Error('Errore nella risposta dal server');
        }
        const data = await response.json();
        console.log(data);
        if (Array.isArray(data)) {
          setServizi(data);
        } else {
          throw new Error('Formato dati non valido');
        }
      } catch (error) {
        console.error('Errore nel caricamento dei servizi:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Container>
      {/* Sezione Hero */}
      <div className="hero" style={{ backgroundImage: `url(${immagineHero})` }}>
        <img src={immagineHero} alt="Barbiere al lavoro" className="img-fluid" /> {/* Aggiunto img-fluid */}
        <div className="hero-content">
          <Container>
            <h1>Il Tuo Stile, la Nostra Passione</h1>
            <p>Scopri i nostri servizi di taglio, barba e cura della persona.</p>
          </Container>
        </div>
      </div>

      {/* Sezione Servizi */}
      <Container className="servizi">
        {isLoading ? (
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Caricamento in corso...</span>
          </Spinner>
        ) : error ? (
          <Alert variant="danger">Si è verificato un errore: {error}</Alert>
        ) : (
          <>
            <h2>I Nostri Servizi</h2>
            <Row>
              {servizi.map((servizio) => (
                <Col key={servizio._id} xs={12} sm={6} md={3} lg={4} className="mb-4">
                  <Card className="mb-2" body style={{ padding: "0.5rem" }} onClick={() => navigate(`post/${servizio._id}`)}>
                    <Card.Img variant="top" src={servizio.cover} alt={servizio.title} style={{ maxHeight: "300px", objectFit: "cover" }} />
                    <Card.Body>
                      <Card.Title style={{ maxHeight: "3em", overflow: "hidden", textOverflow: "ellipsis" }}>{servizio.title}</Card.Title>
                      <Button variant="primary" size="sm" onClick={() => navigate(`post/${servizio._id}`)}>
                        Prenota
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

          </>
        )}
      </Container>
    </Container>
  );
}

export default Servizi;
