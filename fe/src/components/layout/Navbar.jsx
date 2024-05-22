import React, { useContext } from "react";
import { Container, Navbar, Nav, Image, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // Import as a named export

function MyNavbar({ onLogout }) {
    const { isAuthenticated, user } = useContext(AuthContext); // Get authentication status and user data from context
    const navigate = useNavigate(); // Hook for navigation

    const handleLogout = () => {
        onLogout(); // Call the onLogout function passed as a prop (to handle logout in the parent component)
        navigate("/home"); // Navigate to the home page after logout
    };

    return (
        <Navbar bg="light" expand="lg" className="mb-3">
            <Container>
                {/* Brand/Logo */}
                <Navbar.Brand as={Link} to="/home">
                    ScissorHand
                </Navbar.Brand>

                {/* Hamburger Menu (for smaller screens) */}
                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                {/* Collapsible Content */}
                <Navbar.Collapse id="basic-navbar-nav">
                    {/* Left-Aligned Navigation Links */}
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/home">
                            Home
                        </Nav.Link>
                        {/* Conditionally show "Create Post" link if authenticated */}
                        {isAuthenticated && (
                            <Nav.Link as={Link} to="/create-post">
                                Crea Post
                            </Nav.Link>
                        )}
                        {/* ...other navigation links... */}
                    </Nav>

                    {/* Right-Aligned User Actions */}
                    <Nav>
                        {/* Show user dropdown if authenticated, else show login/registration */}
                        {isAuthenticated && user ? (
                            <Dropdown align="end">
                                <Dropdown.Toggle
                                    variant="link"
                                    id="dropdown-user"
                                    className="d-flex align-items-center"
                                >
                                    <Image
                                        src={user.avatar || "path/to/default-avatar.jpg"} // Use user's avatar or a default
                                        roundedCircle
                                        width="30"
                                        height="30"
                                        alt="User Avatar"
                                    />
                                    <span className="ms-2">{user.name}</span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item as={Link} to="/profile">
                                        Profile
                                    </Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/settings">
                                        Settings
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">
                                    Login
                                </Nav.Link>
                                <Nav.Link as={Link} to="/registrazione">
                                    Registration
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
