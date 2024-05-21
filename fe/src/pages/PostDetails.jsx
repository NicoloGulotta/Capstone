import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Spinner, Alert } from 'react-bootstrap';

function PostDetails() {
    const { postId } = useParams(); // Ottieni l'ID del post dai parametri dell'URL
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:3001/post/${postId}`);
                if (!response.ok) {
                    throw new Error('Post non trovato');
                }
                const data = await response.json();
                setPost(data);
            } catch (error) {
                console.error('Errore nel caricamento del post:', error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [postId]);

    if (isLoading) {
        return <Spinner animation="border" role="status" />;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <Container>
            <Card>
                <Card.Img variant="top" src={post.image} alt={post.title} />
                <Card.Body>
                    <Card.Title>{post.title}</Card.Title>
                    <Card.Text>{post.content}</Card.Text>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default PostDetails;
