import React, { useState } from 'react';

function CreatePostForm() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [error, setError] = useState(null); // Stato per gestire gli errori

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null); // Resetta l'errore ad ogni invio

        const formData = new FormData();
        formData.append('data', JSON.stringify({ title, content, author: '664484e7ca15fc8eaf9f4782' })); // Sostituisci 'ID_AUTORE' con l'ID dell'utente loggato
        formData.append('cover', coverImage);

        try {
            const response = await fetch('http://localhost:3001/post/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjQ0NjdkYWQ4OTBkMWY0NWU4ZTRkMDgiLCJpYXQiOjE3MTU3NTk2OTEsImV4cCI6MTcxNTg0NjA5MX0.himjfkF5fBXlS8uVYJSru9h5sacmpKFAjTxLsWCq2SM`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json(); // Ottieni i dettagli dell'errore dal backend
                throw new Error(errorData.error || 'Errore durante la creazione del post.');
            }

            const data = await response.json();
            console.log('Post creato:', data);
            // Qui puoi reindirizzare l'utente o aggiornare lo stato dell'app
        } catch (error) {
            console.error('Errore durante la creazione del post:', error.message);
            setError(error.message); // Imposta il messaggio di errore nello stato
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>} {/* Mostra l'errore se presente */}

            <div>
                <label htmlFor="title">Titolo:</label>
                <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
                <label htmlFor="content">Contenuto:</label>
                <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} />
            </div>

            <div>
                <label htmlFor="cover">Immagine di Copertina:</label>
                <input type="file" id="cover" onChange={(e) => setCoverImage(e.target.files[0])} />
            </div>

            <button type="submit">Crea Post</button>
        </form>
    );
}

export default CreatePostForm;
