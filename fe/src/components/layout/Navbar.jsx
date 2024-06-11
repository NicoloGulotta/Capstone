import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Navbar, Nav, Dropdown } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";

function MyNavbar() {
    const { isAuthenticated, user, setIsAuthenticated, setUser, setToken, logout } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Verifica se l'utente è autenticato
        const storedToken = localStorage.getItem("token");

        if (storedToken) {
            setIsAuthenticated(true);
            setToken(storedToken);
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    }, [setIsAuthenticated, setToken]);

    return (
        <>

            {/* Mostra un messaggio di caricamento finché l'autenticazione non è verificata */}
            {!isAuthenticated && !setToken(null) && !setUser(null) && isLoading ? (
                <p>Caricamento...</p>
            ) : (
                <Navbar bg="dark" variant="dark" expand="lg" className="mb-3 ">
                    <Container>
                        <Navbar.Brand as={Link} to="/">
                            ScissorHand
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="m-auto"><Nav.Link as={Link} to="/">
                                Home
                            </Nav.Link>
                                {/* Mostra il link "Crea Post" solo se l'utente è autenticato */}
                                {/* {isAuthenticated && isAdmin (
                            <Nav.Link as={Link} to="/create-post">
                                Crea Post
                            </Nav.Link>
                        )} */}
                            </Nav>
                            <Nav>

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
                                            <Dropdown.Item as={Link} to="/" onClick={logout}>Logout</Dropdown.Item>
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
            )}
        </>
    );
}
export default MyNavbar;
