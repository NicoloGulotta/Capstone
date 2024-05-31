import { Router } from "express";
import dotenv from 'dotenv';
import Post from "../models/post.model.js";
import Comment from "../models/comments.model.js"; // Corretto il nome del modello in "comment.model.js"
import postCover from "../middelware/postCover.js";
import createError from 'http-errors';
import { authMiddleware } from "../auth/auth.js";
import mongoose from 'mongoose';

dotenv.config();

const postRouter = Router();

// GET /posts: Ottieni tutti i post
postRouter.get('/', async (req, res, next) => {
    try {
        const posts = await Post.find().populate(["user", "comments"]); // Usa populate per ottenere i dati correlati di user e comments
        res.send(posts);
    } catch (error) {
        next(error);
    }
});

// GET /posts/:postId: Ottieni un post specifico tramite ID
postRouter.get('/:postId', async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
            return next(createError(400, "ID post non valido")); // Corretto il messaggio di errore
        }

        const post = await Post.findById(req.params.postId)
            .populate("comments") // Popola i commenti
            .lean(); // Usa lean() per ottenere un oggetto JavaScript semplice

        if (!post) {
            return next(createError(404, "Post non trovato"));
        }
        res.send(post);
    } catch (error) {
        next(error);
    }
});

// PUT /posts/:postId: Aggiorna un post esistente (richiede autenticazione)
postRouter.put('/:postId', authMiddleware, async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
            return next(createError(400, "ID post non valido"));
        }

        const post = await Post.findByIdAndUpdate(req.params.postId, req.body, { new: true });
        if (!post) {
            return next(createError(404, "Post non trovato"));
        }
        res.send(post);
    } catch (error) {
        next(error);
    }
});

// DELETE /posts/:postId: Elimina un post (richiede autenticazione)
postRouter.delete('/:postId', authMiddleware, async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
            return next(createError(400, "ID post non valido"));
        }

        const post = await Post.findByIdAndDelete(req.params.postId);
        if (!post) {
            return next(createError(404, "Post non trovato"));
        }
        res.send(post);
    } catch (error) {
        next(error);
    }
});

// POST /posts: Crea un nuovo post (richiede autenticazione e postCover)
postRouter.post('/', authMiddleware, postCover, async (req, res, next) => { // Corretto il percorso a "/posts"
    try {
        const data = req.body.data ? JSON.parse(req.body.data) : req.body;
        const userId = req.user._id;
        const cover = req.file ? req.file.filename : undefined;

        if (!data.title || !data.content) {
            return next(createError(400, "Titolo e contenuto sono obbligatori"));
        }

        const post = await Post.create({ ...data, user: userId, cover });
        res.status(201).send(post);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return next(createError(400, error.message));
        } else {
            console.error("Errore durante la creazione del post:", error);
            next(error);
        }
    }
});

// PATCH /posts/:postId/cover: Aggiorna l'immagine di copertina di un post
postRouter.patch('/:postId/cover', authMiddleware, postCover, async (req, res, next) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.postId,
            { cover: req.file.filename },
            { new: true }
        );
        if (!updatedPost) {
            return next(createError(404, "Post non trovato"));
        }
        res.send(updatedPost);
    } catch (error) {
        next(error);
    }
});
// GET /posts/:postId/comments: Ottieni i commenti di un post specifico
postRouter.get("/:postId/comments", async (req, res, next) => {
    try {
        const postId = req.params.postId;

        // Verifica se l'ID del post è valido
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return next(createError(400, "ID post non valido"));
        }

        // Trova tutti i commenti del post specificato, filtrando il campo `comment`
        const comments = await Comment.find({
            post: postId,
            _id: { $nin: Post.comment }  // <-- Filtra commenti non presenti in 'comment'
        })
            .populate("author");

        res.send(comments);
    } catch (error) {
        next(error);
    }
});
// GET /comments/user/:userId: Ottieni tutti i commenti di uno specifico utente
postRouter.get('/comments/:userId', async (req, res, next) => {
    try {
        const userId = req.params.userId;

        // Verifica se l'ID utente è valido
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return next(createError(400, "ID utente non valido"));
        }

        // Trova tutti i commenti dell'utente specificato
        const comments = await Comment.find({ author: userId }).populate("author"); // Popola i dettagli dell'autore

        res.send(comments);
    } catch (error) {
        next(error);
    }
});

// POST /posts/:postId/comments: Crea un nuovo commento
postRouter.post("/:postId/comments", authMiddleware, async (req, res, next) => {
    try {
        const commentData = req.body;
        commentData.author = req.user._id;
        commentData.post = req.params.postId; // Associa il commento al post

        const comment = await Comment.create(commentData);

        // Aggiorna SOLO il campo 'comments'
        const post = await Post.findByIdAndUpdate(
            req.params.postId,
            { $push: { comments: comment._id } },
            { new: true }
        ).populate("comments");

        if (!post) {
            return next(createError(404, "Post non trovato"));
        }

        res.send(post);
    } catch (error) {
        next(error);
    }
});
// async function removeCommentField() {
//     try {
//         const result = await Post.updateMany({}, { $unset: { comment: "" } });
//         console.log(`Campo 'comment' rimosso da ${result.modifiedCount} documenti.`);
//     } catch (error) {
//         console.error("Errore durante la rimozione del campo:", error);
//     }
// }

// removeCommentField();

// PUT /posts/:postId/comments/:commentId: Aggiorna un commento esistente
postRouter.put('/:postId/comments/:commentId', authMiddleware, async (req, res, next) => {
    try {
        // Verifica che l'utente autenticato sia l'autore del commento
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return next(createError(404, "Commento non trovato"));
        }

        if (comment.author.toString() !== req.user._id.toString()) { // Confronta gli ID come stringhe
            return next(createError(403, "Non autorizzato a modificare questo commento"));
        }

        // Aggiorna il commento
        const updatedComment = await Comment.findByIdAndUpdate(req.params.commentId, req.body, { new: true });

        res.send(updatedComment);
    } catch (error) {
        next(error);
    }
});

// DELETE /posts/:postId/comments/:commentId: Elimina un commento
postRouter.delete('/:postId/comments/:commentId', authMiddleware, async (req, res, next) => {
    try {
        // Verifica che l'utente autenticato sia l'autore del commento
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return next(createError(404, "Commento non trovato"));
        }

        if (comment.author.toString() !== req.user._id.toString()) {
            return next(createError(403, "Non autorizzato a eliminare questo commento"));
        }

        const deletedComment = await Comment.findByIdAndDelete(req.params.commentId);
        await Post.findByIdAndUpdate(req.params.postId, { $pull: { comments: req.params.commentId } });
        res.send({ message: "Commento eliminato con successo" });
    } catch (error) {
        next(error);
    }
});


export default postRouter;
