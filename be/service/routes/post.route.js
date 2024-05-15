import { Router } from "express";
import { config } from 'dotenv';
import Post from "../models/post.model.js";
import Comment from "../models/comments.model.js";
import postCover from "../middelware/postCover.js";
import createError from 'http-errors';
import { authMiddleware } from "../auth/auth.js";
import mongoose from 'mongoose';

config(); // Carica le variabili d'ambiente

const postRouter = Router();

// GET /posts: Ottieni tutti i post
postRouter.get('/posts', async (req, res, next) => {
    try {
        const posts = await Post.find().populate(["author", "comments"]);
        res.send(posts);
    } catch (error) {
        next(error);
    }
});

// GET /posts/:postId: Ottieni un post specifico tramite ID
postRouter.get('/posts/:postId', async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
            return next(createError(400, "ID Post non valido"));
        }

        const post = await Post.findById(req.params.postId).populate(["author", "comments"]);
        if (!post) {
            return next(createError(404, "Post non trovato"));
        }
        res.send(post);
    } catch (error) {
        next(error);
    }
});

// PUT /posts/:postId: Aggiorna un post esistente (richiede autenticazione)
postRouter.put('/posts/:postId', authMiddleware, async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
            return next(createError(400, "ID Post non valido"));
        }

        const post = await Post.findByIdAndUpdate(req.params.postId, req.body, { new: true });
        if (!post) {
            return next(createError(404, "Post non trovato, impossibile aggiornare"));
        }
        res.send(post);
    } catch (error) {
        next(error);
    }
});

// DELETE /posts/:postId: Elimina un post (richiede autenticazione)
postRouter.delete('/posts/:postId', authMiddleware, async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
            return next(createError(400, "ID Post non valido"));
        }

        const post = await Post.findByIdAndDelete(req.params.postId);
        if (!post) {
            return next(createError(404, "Post non trovato, impossibile eliminare"));
        }
        res.send(post);
    } catch (error) {
        next(error);
    }
});

// POST /posts: Crea un nuovo post (richiede autenticazione e postCover)
postRouter.post('/posts', authMiddleware, postCover, async (req, res, next) => {
    try {
        const data = req.body.data ? JSON.parse(req.body.data) : req.body;
        const userId = req.user._id;
        const cover = req.file ? req.file.filename : undefined; // Ottieni il percorso del file o undefined se non presente

        // Validazione dei dati
        if (!data.title || !data.content) {
            return next(createError(400, "Titolo e contenuto sono obbligatori"));
        }

        const post = await Post.create({ ...data, author: userId, cover }); // Usa la variabile cover
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

// PATCH /posts/:postId/cover: Aggiorna l'immagine di copertina di un post (richiede autenticazione)
postRouter.patch('/posts/:postId/cover', authMiddleware, postCover, async (req, res, next) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.postId,
            { cover: req.file.filename }, // Assumi che req.file.filename contenga il nome del file caricato
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
postRouter.post('/posts/:postId/comments', async (req, res, next) => {
    try {
        const comment = await Comment.create(req.body);
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
// PUT /:postId/comments/:commentId: Aggiorna un commento esistente
postRouter.put('/:postId/comments/:commentId', async (req, res, next) => {
    try {
        const comment = await Comment.findByIdAndUpdate(req.params.commentId, req.body, { new: true }); // Aggiorna il commento
        if (!comment) {
            return next(createError(404, "Commento non trovato"));
        }
        res.send(comment);
    } catch (error) {
        next(error);
    }
});

// DELETE /:postId/comments/:commentId: Elimina un commento
postRouter.delete('/:postId/comments/:commentId', async (req, res, next) => {
    try {
        const deletedComment = await Comment.findByIdAndDelete(req.params.commentId); // Elimina il commento
        if (!deletedComment) {
            return next(createError(404, "Commento non trovato"));
        }
        await Post.findByIdAndUpdate(req.params.postId, { $pull: { comments: req.params.commentId } }); // Rimuovi il commento dall'array del post
        res.send({ message: "Commento eliminato con successo" });
    } catch (error) {
        next(error);
    }
});

export default postRouter;
