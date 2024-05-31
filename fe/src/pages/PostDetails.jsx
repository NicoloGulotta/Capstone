import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Container, Card, Spinner, Alert, Form, Button } from "react-bootstrap";
import AppointmentForm from "./AppointmentForm";
import { AuthContext } from "../context/AuthContext";
import "./../styles/PostDetails.css";
import Comment from "./Comments";

function PostDetails() {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, isAuthenticated, token } = useContext(AuthContext);
    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            try {
                const postResponse = await fetch(`http://localhost:3001/post/${postId}`);
                if (!postResponse.ok) {
                    throw new Error("Post non trovato");
                }
                const postData = await postResponse.json();
                setPost(postData);

                const commentsResponse = await fetch(
                    `http://localhost:3001/post/${postData._id}/comments`
                );
                if (!commentsResponse.ok) {
                    throw new Error("Errore nel caricamento dei commenti");
                }
                const commentsData = await commentsResponse.json();
                setComments(commentsData);
            } catch (error) {
                console.error("Errore durante il caricamento:", error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [postId]); // Dipendenza da postId per aggiornare i commenti se cambia il post

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!newCommentText.trim()) {
            return; // Non inviare commenti vuoti
        }

        try {
            const response = await fetch(`http://localhost:3001/post/${postId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    text: newCommentText,
                    author: user._id,
                }),
            });

            if (!response.ok) {
                throw new Error("Errore nell'invio del commento");
            }

            const newComment = await response.json();
            setComments((prevComments) => [...prevComments, newComment]);
            setNewCommentText("");
        } catch (error) {
            console.error("Errore durante l'invio del commento:", error);
        }
    };

    // Rendering condizionale
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

    if (!isAuthenticated || !user || !user._id) {
        return (
            <Container className="mt-5">
                <Alert variant="warning">
                    Effettua la registrazione o accedi per vedere i dettagli
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Card className="mb-2" body style={{ padding: "0.5rem" }}>
                <Card.Img
                    variant="top"
                    src={post.cover}
                    alt={post.title}
                    style={{ maxHeight: "400px", objectFit: "cover" }}
                />
                <Card.Body>
                    <Card.Title
                        style={{ maxHeight: "3em", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                        {post.title}
                    </Card.Title>
                    <Card.Text>{post.content}</Card.Text>
                </Card.Body>
            </Card>
            <AppointmentForm postId={postId} userId={user._id} />


            {user && (
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="commentTextarea">
                        <Form.Label>Scrivi un commento</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="dark" className="my-2" type="submit">
                        Invia
                    </Button>
                </Form>
            )}
            <div className="comments-section">
                <h3>Commenti</h3>
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <Comment key={comment._id} comment={comment} />
                    ))
                ) : (
                    <p>Caricamento commenti...</p>
                )}

            </div>

        </Container>
    );
}

export default PostDetails;
