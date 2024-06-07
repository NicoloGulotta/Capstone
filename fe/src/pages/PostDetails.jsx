import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Container, Card, Spinner, Alert, Form, Button } from "react-bootstrap";
import AppointmentForm from "./AppointmentForm";
import { AuthContext } from "../context/AuthContext";
import "./../styles/PostDetails.css"; // Importa il CSS personalizzato
import Rating from "react-rating-stars-component";
import { parseISO, format } from "date-fns"; // Import parseISO and format
import it from "date-fns/locale/it";
import { useNavigate } from "react-router-dom";
function PostDetails() {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, isAuthenticated, token } = useContext(AuthContext);
    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState("");
    const [newCommentRating, setNewCommentRating] = useState(0);

    // Effetto per caricare i dati del post e dei commenti all'avvio
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true); // Mostra l'indicatore di caricamento

            try {
                // Carica i dati del post e dei commenti in parallelo
                const [postResponse, commentsResponse] = await Promise.all([
                    fetch(`http://localhost:3001/post/${postId}`),
                    fetch(`http://localhost:3001/post/${postId}/comments`),
                ]);

                // Gestione degli errori per la risposta del post
                if (!postResponse.ok) {
                    throw new Error("Post non trovato");
                }
                const postData = await postResponse.json();
                setPost(postData);

                // Gestione degli errori per la risposta dei commenti
                if (!commentsResponse.ok) {
                    throw new Error("Errore nel caricamento dei commenti");
                }
                const commentsData = await commentsResponse.json();
                setComments(commentsData);
            } catch (error) {
                setError(error.message); // Imposta il messaggio di errore
            } finally {
                setIsLoading(false); // Nascondi l'indicatore di caricamento
            }
        };

        fetchData(); // Chiama la funzione per caricare i dati
    }, [postId, token]);
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!newCommentText.trim() || newCommentRating === 0) {
            return; // Non inviare commenti vuoti o senza valutazione
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
                    rating: newCommentRating,
                }),
            });

            if (!response.ok) {
                throw new Error("Errore nell'invio del commento. Assicurati di aver effettuato l'accesso.");
            }

            const newComment = await response.json();
            setComments((prevComments) => [...prevComments, newComment]);
            setNewCommentText("");
            setNewCommentRating(0);
        } catch (error) {
            console.error("Errore durante l'invio del commento:", error);
            setError("Si è verificato un errore durante l'invio del commento. Riprova più tardi.");
        }
    };
    const navigate = useNavigate();

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
        navigate("/login");
        return (
            <Container className="mt-5 ">
                <Alert variant="warning ">
                    Effettua la registrazione o accedi per vedere i dettagli
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5 ">
            <Card className="mb-2 bg-dark" body style={{ padding: "0.5rem" }}>
                <Card.Img
                    variant="top"
                    src={post.cover}
                    alt={post.title}
                    style={{ maxHeight: "400px", objectFit: "cover" }}
                />
                <Card.Body>
                    <Card.Title className="text-white"
                        style={{ maxHeight: "3em", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                        {post.title}
                    </Card.Title>
                    <Card.Text className="text-white">{post.content}</Card.Text>
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
                    <Form.Label className="mb-2">Valutazione</Form.Label>
                    <Rating
                        name="rating"
                        size={30}
                        value={newCommentRating}
                        onChange={(newRating) => setNewCommentRating(newRating)}
                        activeColor="#ffd700" // Classic gold for active stars
                    />
                    <Button variant="dark" className="my-2" type="submit">
                        Invia
                    </Button>
                </Form>
            )}

            <div className="comments-section">
                <h3>Commenti</h3>
                {comments.length > 0 ? (
                    comments.map((comment) => {
                        // Format the date correctly
                        const formattedDate = format(parseISO(comment.createdAt), "PPPPp", { locale: it });

                        return (
                            <div key={comment._id} className="comment-container mb-3">
                                {comment.author && (
                                    <div className="comment-author">
                                        {/* Check if author.avatar exists before rendering */}
                                        {comment.author.avatar && (
                                            <img
                                                className="comment-author-avatar"
                                                alt={`${comment.author.name}'s avatar`}
                                                src={comment.author.avatar}
                                            />
                                        )}
                                        <h5>
                                            {comment.author.name} {comment.author.surname}
                                        </h5>
                                    </div>
                                )}
                                <p className="mb-0">{comment.text}</p>
                                <Rating value={comment.rating} edit={false} isHalf={true} />
                                <span className="comment-date text-muted">Pubblicato: </span>
                                <span className="text-black-50S">{formattedDate}</span>
                            </div>
                        );
                    })
                ) : (
                    <p>Nessun commento ancora.</p>
                )}
            </div>
        </Container>
    );
}
export default PostDetails;
