import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Importato Link per la navigazione
import immagineHero from '../hero.jpg'; // Importato immagine hero (assicurati che il percorso sia corretto)
import '../Home/Home.css'

function Servizi() {
  const [servizi, setServizi] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/post/');
        if (!response.ok) {
          throw new Error('Errore nella risposta dal server');
        }
        const data = await response.json();
        setServizi(data);
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
      <div className="hero">
        <img src={immagineHero} alt="Hero Image" />
        <div className="hero-content"> {/* Aggiunto un contenitore per il testo */}
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
                <Col key={servizio._id} md={4}>
                  <Card>
                    <Card.Img variant="top" src={servizio.image} alt={servizio.title} />
                    <Card.Body>
                      <Card.Title>{servizio.title}</Card.Title>
                      <Card.Text>{servizio.content}</Card.Text>
                      <Button variant="primary" as={Link} to="/prenota">Prenota</Button>
                      {/* Usato Link per la navigazione */}
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
