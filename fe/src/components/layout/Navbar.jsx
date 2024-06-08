import React, { useContext, useState, useEffect } from "react";
import { Container, Navbar, Nav, Dropdown, Button, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function MyNavbar({ onLogout }) {
    const { isAuthenticated, user, refetchUserData } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);
    // console.log(user);

    useEffect(() => {
        // This will trigger a refetch whenever authentication changes.
        const fetchData = async () => {
            try {
                await refetchUserData();
            } catch (error) {
                // Handle error if refetch fails (e.g., display an error message)
                console.error('Failed to refetch user data:', error);
            }
        };

        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated, refetchUserData]);
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
                        {/* {isAuthenticated && isAdmin (
                            <Nav.Link as={Link} to="/create-post">
                                Crea Post
                            </Nav.Link>
                        )} */}

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
                        <Button variant="outline-light" onClick={handleShow}>
                            Contattaci
                        </Button>
                        {isAuthenticated && user ? (
                            <Dropdown align="end">
                                <Dropdown.Toggle variant="link" id="dropdown-user" className="text-light d-flex align-items-center text-decoration-none">
                                    <img
                                        src={user?.avatar || 'https://cdn.pixabay.com/photo/2017/02/01/10/46/avatar-2029577_1280.png'}
                                        border-radius="50%"
                                        width="25"
                                        height="25"
                                        alt="User Avatar"
                                    />
                                    <h5 className="m-2">{user?.name}</h5>
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
                                    <Dropdown.Item as={Link} to="/" onClick={onLogout}>Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login" className="text-light">
                                    Login
                                </Nav.Link>
                                <Nav.Link as={Link} to="/register" className="text-light">
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
