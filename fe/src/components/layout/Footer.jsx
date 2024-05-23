import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
    return (
        <footer className="bg-light text-center text-lg-start">
            <Container className="p-4">
                <Row>

                    <Col lg={3} md={6} mb={4} mb-md={0}>

                        <ul className="list-unstyled mb-0">
                            <li>
                            </li>

                        </ul>
                    </Col>

                    <Col lg={3} md={6} mb={4} mb-md={0}>
                        <h5 className="text-uppercase mb-0">Seguici sui nostri social</h5>

                        <ul className="list-unstyled">
                            <li>
                                <a href="#!" className="text-dark">Facebook</a>
                            </li>
                            <li>
                                <a href="#!" className="text-dark">Instagram</a>
                            </li>
                        </ul>
                    </Col>
                </Row>
            </Container>
            <a href="/" className="text-dark">Torna su</a>

            <div className="text-center p-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                © 2023 Copyright:
                <a className="text-dark" href="https://github.com/NicoloGulotta/Capstone.git">Nicolò Gulotta</a>
            </div>
        </footer>
    );
}

export default Footer;
