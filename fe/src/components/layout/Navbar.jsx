import React, { useContext } from 'react';
import { Container, Navbar, Nav, Image, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

function MyNavbar({ onLogout }) {
    const { isLoggedIn, userData } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    return (
        <Navbar bg="light" expand="lg" className="mb-3">
            <Container>
                <Navbar.Brand as={Link} to="/">ScissorHand</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {/* ... altri link di navigazione ... */}
                    </Nav>
                    <Nav>
                        {isLoggedIn && userData ? (
                            <Dropdown align="end">
                                <Dropdown.Toggle variant="link" id="dropdown-user" className="d-flex align-items-center">
                                    <Image src={userData.avatar || 'path/to/default-avatar.jpg'}
                                        roundedCircle width="30" height="30" alt="Avatar utente" />
                                    <span className="ms-2">{userData.name}</span>
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
