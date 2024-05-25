import React, { useState } from 'react';

const Footer = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleModalToggle = () => setModalOpen(!modalOpen);
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handleMessageChange = (e) => setMessage(e.target.value);

    return (
        <footer className="d-flex justify-content-center py-0" style={{ color: 'lightgray' }}>
            <div className="container-fluid row">
                <div className="row my-3">
                    <div className="row mb-2 justify-content-start">
                        <i className="fa-brands fa-square-facebook col-auto px-2 text-secondary"></i>
                        <i className="fa-brands fa-instagram col-auto px-2 text-secondary"></i>
                        <i className="fa-brands fa-twitter col-auto px-2 text-secondary"></i>
                        <i className="fa-brands fa-youtube col-auto px-2 text-secondary"></i>
                    </div>
                </div>
                {['Privacy', 'Contact Us'].map((item, index) => (
                    <div className="col-3" key={index}>
                        <ul className="p-0 mb-2">
                            <li className="list-group-item border-none mb-3 text-secondary">{item}</li>
                        </ul>
                    </div>
                ))}
                {['Cookie Preferences'].map((item, index) => (
                    <div className="col-3" key={index}>
                        <ul className="p-0 mb-2">
                            <li className="list-group-item border-none mb-3 text-secondary">{item}</li>
                        </ul>
                    </div>
                ))}
                {['Gift Cards', 'Terms of Use'].map((item, index) => (
                    <div className="col-3" key={index}>
                        <ul className="p-0 mb-2">
                            <li className="list-group-item border-none mb-3 text-secondary">{item}</li>
                        </ul>
                    </div>
                ))}
                <div className="col-12 my-2">
                    <button
                        type="button"
                        className="btn rounded-0 border-white my-2 text-secondary"
                        onClick={handleModalToggle}
                    >
                        Contact Us
                    </button>
                    {modalOpen && (
                        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h1 className="modal-title fs-5" id="exampleModalLabel">New message</h1>
                                        <button type="button" className="btn-close" onClick={handleModalToggle} aria-label="Close"></button>
                                    </div>
                                    <div className="modal-body">
                                        <form>
                                            <div className="mb-3">
                                                <label htmlFor="recipient-name" className="col-form-label">Inserisci email:</label>
                                                <input type="text" className="form-control" id="recipient-name" value={email} onChange={handleEmailChange} />
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="message-text" className="col-form-label">Message:</label>
                                                <textarea className="form-control" id="message-text" value={message} onChange={handleMessageChange}></textarea>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={handleModalToggle}>Close</button>
                                        <button type="button" className="btn btn-primary">Send message</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="row text-secondary">
                        © 2024 Nicolò Gulotta. All Rights Reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
