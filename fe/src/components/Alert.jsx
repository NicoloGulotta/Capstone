// components/Alert.js
import React, { useState, useEffect } from 'react';
import Alert from 'react-bootstrap/Alert';

function CustomAlert({ type, message, timeout = 5000 }) {
    const [show, setShow] = useState(true);

    useEffect(() => {
        let timer = setTimeout(() => setShow(false), timeout);
        return () => clearTimeout(timer); // Pulisci il timer se il componente viene smontato
    }, [timeout]);

    return (
        show && (
            <Alert variant={type} onClose={() => setShow(false)} dismissible>
                {message}
            </Alert>
        )
    );
}

export default CustomAlert;
