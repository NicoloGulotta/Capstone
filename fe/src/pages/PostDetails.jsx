import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Container, Card, Spinner, Alert } from "react-bootstrap";
import AppointmentForm from "./AppointmentForm";
import { AuthContext } from "../context/AuthContext";
import './../styles/PostDetails.css';

function PostDetails() {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, isAuthenticated } = useContext(AuthContext);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            try {
                const response = await fetch(`http://localhost:3001/post/${postId}`);
                if (!response.ok) {
                    throw new Error("Post non trovato");
                }
                const data = await response.json();
                setPost(data);
            } catch (error) {
                console.error("Errore durante il caricamento del post:", error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [postId]);

    // Rendering condizionale migliorato
    if (isLoading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    // Controllo più specifico sull'utente e sull'autenticazione
    if (!isAuthenticated || !user || !user._id) {
        return (
            <Container className="mt-5">
                <Alert variant="warning">Effettua la registrazione o accedi per vedere i dettagli</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Card className="mb-2" body style={{ padding: "0.5rem" }} >
                <Card.Img variant="top" src={post.cover} alt={post.title} style={{ maxHeight: "400px", objectFit: "cover" }} />
                <Card.Body>
                    <Card.Title style={{ maxHeight: "3em", overflow: "hidden", textOverflow: "ellipsis" }}>{post.title}</Card.Title>
                    <Card.Text>{post.content}</Card.Text>
                </Card.Body>
            </Card>

            <AppointmentForm postId={postId} userId={user._id} />
        </Container>
    );
}

export default PostDetails;
