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
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:3001/post/${postId}`);
                if (!response.ok) {
                    throw new Error("Post not found");
                }
                const data = await response.json();
                setPost(data);
                console.log(data);
                console.log(postId);
            } catch (error) {
                console.error("Error loading post:", error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [postId]);
    // Log post dopo che è stato aggiornato
    useEffect(() => {
        console.log(post);
    }, [post]);
    // Enhanced Conditional Rendering
    if (isLoading) {
        return <Spinner animation="border" role="status" />;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    // Check both post and user before accessing user._id
    if (!post || !user || !user.user) {
        return <Alert variant="warning">Post or user information is missing.</Alert>;
    }
    console.log(post, user.user._id);
    return (
        <Container>
            <Card className="card-details">
                <Card.Img
                    variant="top"
                    src={post.cover}
                    alt={post.title}
                    className="card-img-top" />
                <Card.Body>
                    <Card.Title>{post.title}</Card.Title>
                    <Card.Text>{post.content}</Card.Text>
                </Card.Body>
            </Card>

            {/* Pass userId safely */}
            <AppointmentForm postId={postId} userId={user.user._id} />
        </Container>
    );
}

export default PostDetails;
