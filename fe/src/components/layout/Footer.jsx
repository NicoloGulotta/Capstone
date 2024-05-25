import React, { useState } from 'react';

const Footer = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleModalToggle = () => setModalOpen(!modalOpen);
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handleMessageChange = (e) => setMessage(e.target.value);

    return (
        <footer className="bg-dark text-white py-4">
            <div className="container">
                <div className="row">
                    <div className="col-md-4">
                        <h4>Informazioni Legali</h4>
                        <ul className="list-unstyled">
                            <li><a href="#">Privacy</a></li>
                            <li><a href="#">Cookie Preferences</a></li>
                            <li><a href="#">Terms of Use</a></li>
                        </ul>
                    </div>
                    <div className="col-md-4">
                        <h4>Assistenza Clienti</h4>
                        <ul className="list-unstyled">
                            <li><a href="#">Contattaci</a></li>
                            <li><a href="#">Gift Cards</a></li>
                        </ul>
                    </div>
                    <div className="col-md-4">
                        <h4>Seguici</h4>
                        {/* Icone Social più grandi e visibili */}
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
