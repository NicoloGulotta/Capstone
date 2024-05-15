import React, { useState, useEffect } from 'react';

function TestComponent() {
    const [posts, setPosts] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Token di autenticazione non trovato');
                }

                const headers = {
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjQ0NjdkYWQ4OTBkMWY0NWU4ZTRkMDgiLCJpYXQiOjE3MTU3NTk2OTEsImV4cCI6MTcxNTg0NjA5MX0.himjfkF5fBXlS8uVYJSru9h5sacmpKFAjTxLsWCq2SM`
                };

                // Ottieni i post
                const postsResponse = await fetch('/post/posts', { headers });
                if (!postsResponse.ok) {
                    throw new Error('Errore nel caricamento dei post');
                }
                const postsData = await postsResponse.json();
                setPosts(postsData);

                // Ottieni gli appuntamenti
                const appointmentsResponse = await fetch('/appointment', { headers });
                if (!appointmentsResponse.ok) {
                    throw new Error('Errore nel caricamento degli appuntamenti');
                }
                const appointmentsData = await appointmentsResponse.json();
                setAppointments(appointmentsData);

            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h2>Test Componente</h2>
            {error ? (
                <p>Errore: {error}</p>
            ) : (
                <>
                    <h3>Posts:</h3>
                    <ul>
                        {posts.map(post => (
                            <li key={post._id}>
                                {post.title} - {post.content}
                            </li>
                        ))}
                    </ul>

                    <h3>Appuntamenti:</h3>
                    <ul>
                        {appointments.map(appointment => (
                            <li key={appointment._id}>
                                {appointment.serviceType} - {appointment.date}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

export default TestComponent;
