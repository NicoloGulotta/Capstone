import React, { useState, useEffect, useContext } from 'react';
import { Container, Navbar, Nav, Image, Dropdown, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext'; // Importa il contesto di autenticazione

function MyNavbar() {
    // Utilizza il contesto per ottenere lo stato di autenticazione e i dati utente
    const { isLoggedIn, userData, logout } = useContext(AuthContext);

    // Non è più necessario useEffect qui, poiché i dati utente vengono gestiti nel contesto

    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/">ScissorHand</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {/* Altri link di navigazione */}
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/servizi">Servizi</Nav.Link>
                        <Nav.Link as={Link} to="/prenota">Prenota</Nav.Link>
                        <NavDropdown title="Altro" id="basic-nav-dropdown">
                            <NavDropdown.Item as={Link} to="/contatti">Contatti</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/chi-siamo">Chi siamo</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav>
                        {isLoggedIn && userData ? ( // Controllo se l'utente è loggato e se i dati sono disponibili
                            <Dropdown align="end">
                                <Dropdown.Toggle variant="link" id="dropdown-user">
                                    <Image src={userData.avatar} roundedCircle width="30" height="30" alt="Avatar utente" />
                                    <span className="ms-2">{userData.name}</span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item as={Link} to="/profile">Profilo</Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/settings">Impostazioni</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                <Nav.Link as={Link} to="/registrazione">Registrazione</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default MyNavbar;
