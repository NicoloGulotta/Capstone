import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, NavDropdown, Button } from 'react-bootstrap';

function MyNavbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            setUserName('Nome Utente'); // Sostituisci con la logica per ottenere il nome utente
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUserName(null);
    };

    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand href="/home">ScissorHand</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="#home">Home</Nav.Link>
                        <Nav.Link href="#servizi">Servizi</Nav.Link>
                        <Nav.Link href="#appuntamenti">Prenota</Nav.Link>
                        <NavDropdown title="Altro" id="basic-nav-dropdown">
                            <NavDropdown.Item href="#contatti">Contatti</NavDropdown.Item>
                            <NavDropdown.Item href="#chi-siamo">Chi siamo</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav>
                        {isLoggedIn ? (
                            <>
                                <Navbar.Text>Benvenuto, {userName}!</Navbar.Text>
                                <Button variant="outline-primary" onClick={handleLogout}>Logout</Button>
                            </>
                        ) : (
                            <>
                                <Nav.Link href="#login">Login</Nav.Link>
                                <Nav.Link href="#registrazione">Registrazione</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default MyNavbar;
