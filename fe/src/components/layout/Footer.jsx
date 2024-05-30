import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons'; // Importa le icone che vuoi usare
import '../../styles/Footer.css';
const Footer = () => {


    return (
        <footer className="bg-dark text-white py-4">
            <div className="container">
                <div className="row">
                    <div className="col-md-4">
                        <h4>Informazioni Legali</h4>
                        <ul className="list-unstyled">
                            <li><a href="/#">Privacy</a></li>
                            <li><a href="/#">Cookie Preferences</a></li>
                            <li><a href="/#">Terms of Use</a></li>
                        </ul>
                    </div>
                    <div className="col-md-4">
                        <h4>Assistenza Clienti</h4>
                        <ul className="list-unstyled">
                            <li><a href="/#">Contattaci</a></li>
                            <li><a href="/#">Gift Cards</a></li>
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
                            <a href="https://www.linkedin.com/in/tuoprofilolinkedin" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faLinkedin} size="2x" /> {/* Icona LinkedIn */}
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
