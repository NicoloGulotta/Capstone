import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import '../../styles/Footer.css';
const Footer = () => {
    const [showModal, setShowModal] = useState(false);
    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);

    return (
        <footer className="bg-dark text-white py-4 mt-5 fix-bottom">
            <div className="container">
                <div className="row">
                    <div className="col-md-4">
                        <h4 className="text-white">Informazioni Legali</h4>
                        <ul className="list-unstyled">
                            <li><a href="/#" className="text-white">Privacy</a></li>
                            <li><a href="/#" className="text-white">Cookie Preferences</a></li>
                            <li><a href="/#" className="text-white">Terms of Use</a></li>
                        </ul>
                    </div>
                    <div className="col-md-4">
                        <h4 className="text-white">Assistenza Clienti</h4>
                        <ul className="list-unstyled">
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
                            </Modal>                            <li><a href="/#" className="text-white">Gift Cards</a></li>
                        </ul>
                    </div>
                    <div className="col-md-4">
                        <h4>Seguici</h4>
                        <div className="social-icons"> {/* Aggiungi una classe per lo stile delle icone */}
                            <a href="https://www.facebook.com/tuaprofilofacebook" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faFacebook} size="2x" /> {/* Icona Facebook */}
                            </a>
                            <a href="https://www.twitter.com/tuoprofilotwitter" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faTwitter} size="2x" /> {/* Icona Twitter */}
                            </a>
                            <a href="https://www.instagram.com/tuoprofiloinstagram" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faInstagram} size="2x" /> {/* Icona Instagram */}
                            </a>

                        </div>
                    </div>

                </div>
                <div className="row mt-3">
                    <div className="col-12 text-center">
                        <p className="small">&copy; 2024 Nicolò Gulotta. All Rights Reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
