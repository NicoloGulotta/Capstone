import React, { useContext, useState } from "react";
import { Container, Navbar, Nav, Image, Dropdown, Button, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // Assicurati che il percorso sia corretto

function MyNavbar({ onLogout }) {
    const { isAuthenticated, user } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);

    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    ScissorHand
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto"><Nav.Link as={Link} to="/">
                        Home
                    </Nav.Link>
                        {/* Mostra il link "Crea Post" solo se l'utente è autenticato */}
                        {/* {isAuthenticated && (
                            <Nav.Link as={Link} to="/create-post">
                                Crea Post
                            </Nav.Link>
                        )} */}
                        <Button variant="outline-light" onClick={handleShow}>
                            Contattaci
                        </Button>

                        <Modal show={showModal} onHide={handleClose}>
                            <Modal.Header closeButton>
                                <Modal.Title>Contattaci</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <p>
                                    Puoi contattarci al numero di telefono 123-456-7890 o
                                    all'indirizzo email info@hairsalon.com.
                                </p>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>
                                    Chiudi
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </Nav>

                    <Nav>
                        {isAuthenticated ? (
                            <Dropdown align="end">
                                <Dropdown.Toggle variant="link" id="dropdown-user" className="text-light d-flex align-items-center">
                                    <Image
                                        src={user?.avatar || "https://via.placeholder.com/150"}
                                        roundedCircle
                                        width="30"
                                        height="30"
                                        alt="Avatar Utente"
                                    />
                                    <span className="ms-2">{user?.name}</span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu variant="dark">
                                    {user && (
                                        <Dropdown.Item as={Link} to={`/profile`}>
                                            Profilo
                                        </Dropdown.Item>
                                    )}
                                    <Dropdown.Item as={Link} to="/settings">
                                        Impostazioni
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={onLogout}>Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login" className="text-light">
                                    Login
                                </Nav.Link>
                                <Nav.Link as={Link} to="/registrazione" className="text-light">
                                    Registrazione
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default MyNavbar;
