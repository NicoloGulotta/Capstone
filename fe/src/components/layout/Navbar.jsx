import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Navbar, Nav, Dropdown } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";

function MyNavbar({ onLogout }) {
    const { isAuthenticated, user, setIsAuthenticated, setUser, setToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    // Funzione logout (ora è useCallback)
    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        navigate("/login");
    }, [navigate, setIsAuthenticated, setUser, setToken]);

    // Effetto per verificare l'autenticazione all'avvio
    useEffect(() => {
        const checkAuthentication = async () => {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                try {
                    const response = await fetch("http://localhost:3001/auth/profile", {
                        headers: { Authorization: `Bearer ${storedToken}` },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setIsAuthenticated(true);
                        setUser(data);
                        setToken(storedToken);
                    } else {
                        logout(); // Forza il logout se il token non è valido
                    }
                } catch (error) {
                    console.error('Failed to check authentication:', error);
                    // Opzionale: mostrare un alert di errore generico
                }
            }
            setIsLoading(false); // Termina il caricamento
        };

        checkAuthentication();
    }, [logout, setIsAuthenticated, setUser, setToken]); // Dipendenza del logout per useCallback


    return (
        <>

            {/* Mostra un messaggio di caricamento finché l'autenticazione non è verificata */}
            {!isAuthenticated && isLoading ? (
                <p>Caricamento...</p>
            ) : (
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
            )}
        </>
    );
}
export default MyNavbar;
