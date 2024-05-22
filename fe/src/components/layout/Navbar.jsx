import React, { useContext, useState, useEffect } from 'react';
import { Container, Navbar, Nav, Image, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

function MyNavbar({ onLogout }) {
    const { isAuthenticated, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [localIsAuthenticated, setLocalIsAuthenticated] = useState(isAuthenticated);

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    useEffect(() => {
        setLocalIsAuthenticated(isAuthenticated); // Aggiorna lo stato locale quando isAuthenticated cambia
    }, [isAuthenticated]); // Aggiungi isAuthenticated come dipendenza

    return (
        <Navbar bg="light" expand="lg" className="mb-3">
            <Container>
                <Navbar.Brand as={Link} to="/">ScissorHand</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/home">Home</Nav.Link>
                        {/* Aggiungi altri link di navigazione qui */}
                        {localIsAuthenticated && (
                            <Nav.Link as={Link} to="/create-post">Crea Post</Nav.Link>
                        )}
                    </Nav>
                    <Nav>
                        {localIsAuthenticated && user ? (
                            <Dropdown align="end">
                                <Dropdown.Toggle variant="link" id="dropdown-user" className="d-flex align-items-center">
                                    <Image src={user.avatar || 'path/to/default-avatar.jpg'}
                                        roundedCircle width="30" height="30" alt="Avatar utente" />
                                    <span className="ms-2">{user.name}</span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item as={Link} to="/profile">Profilo</Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/settings">Impostazioni</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
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
