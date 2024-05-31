import React from "react";

export default function Comment({ comment }) {
    return (
        <div className="comment-box">
            <div className="comment-author">
                {comment.author?.name || "Utente Anonimo"}
            </div>
            <div className="comment-text">{comment.text}</div>
        </div>
    );
}
