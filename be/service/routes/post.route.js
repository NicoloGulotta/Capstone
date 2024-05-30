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

        const post = await Post.findById(req.params.postId).populate(["user", "comments"]);
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


// POST /posts/:postId/comments: Aggiungi un commento a un post
postRouter.post('/:postId/comments', authMiddleware, async (req, res, next) => { // Aggiunto authMiddleware
    try {
        const commentData = req.body;
        commentData.author = req.user._id; // Assegna l'ID dell'utente autenticato come autore del commento

        const comment = await Comment.create(commentData);

        const post = await Post.findByIdAndUpdate(
            req.params.postId,
            { $push: { comments: comment._id } },
            { new: true }
        ).populate("comments");

        if (!post) {
            return next(createError(404, "Post non trovato"));
        }

        res.send(post); // Invia il post aggiornato con il nuovo commento
    } catch (error) {
        next(error);
    }
});

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
