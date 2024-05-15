import { Router } from "express";
import { config } from 'dotenv';
import Post from "../models/post.model.js";
import Comment from "../models/comments.model.js";
import blogCover from '../middelware/blogCover.js';
import createError from 'http-errors';
import { authMiddleware } from "../auth/auth.js";
import mongoose from 'mongoose';

config(); // Carica le variabili d'ambiente

const postRouter = Router();

// GET /: Ottieni tutti i post
postRouter.get('/', async (req, res, next) => {
    try {
        const posts = await Post.find().populate(["author", "comments"]);
        res.send(posts);
    } catch (error) {
        next(error);
    }
});

// GET /:id: Ottieni un post specifico tramite ID
postRouter.get('/:id', async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return next(createError(400, "ID Post non valido"));
        }

        const post = await Post.findById(req.params.id).populate(["author", "comments"]);
        if (!post) {
            return next(createError(404, "Post non trovato"));
        }
        res.send(post);
    } catch (error) {
        next(error);
    }
});

// PUT /:id: Aggiorna un post esistente
postRouter.put('/:id', authMiddleware, async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return next(createError(400, "ID Post non valido"));
        }

        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!post) {
            return next(createError(404, "Post non trovato"));
        }
        res.send(post);
    } catch (error) {
        next(error);
    }
});

// DELETE /:id: Elimina un post
postRouter.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return next(createError(400, "ID Post non valido"));
        }

        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return next(createError(404, "Post non trovato"));
        }
        res.send(post);
    } catch (error) {
        next(error);
    }
});


// POST /: Crea un nuovo post 
postRouter.post('/', authMiddleware, blogCover, async (req, res, next) => {
    try {
        const data = req.body.data ? JSON.parse(req.body.data) : req.body;

        // Ottieni l'ID utente dal token
        const userId = req.user._id;

        const post = await Post.create({ ...data, author: userId, cover: req.file?.path });
        res.status(201).send(post);
    } catch (error) {
        next(error);
    }
});
// PATCH /:blogId/cover: Aggiorna l'immagine di copertina di un blog
postRouter.patch('/:blogId/cover', blogCover, async (req, res, next) => {
    try {
        const updatedBlog = await Post.findByIdAndUpdate(
            req.params.blogId,
            { cover: req.file.path },
            { new: true }
        );
        if (!updatedBlog) {
            return next(createError(404, "Post non trovato"));
        }
        res.send(updatedBlog);
    } catch (error) {
        next(error);
    }
});

// POST /:blogId/comments: Aggiungi un commento a un blog
postRouter.post('/:blogId/comments', async (req, res, next) => {
    try {
        const comment = await Comment.create(req.body); // Crea un nuovo commento
        const blog = await Post.findByIdAndUpdate(
            req.params.blogId,
            { $push: { comments: comment._id } }, // Aggiungi l'ID del commento all'array dei commenti del blog
            { new: true }
        ).populate("comments"); // Popola i commenti per ottenere tutte le informazioni
        if (!blog) {
            return next(createError(404, "Post non trovato"));
        }
        res.send(blog);
    } catch (error) {
        next(error);
    }
});

// PUT /:blogId/comments/:commentId: Aggiorna un commento esistente
postRouter.put('/:blogId/comments/:commentId', async (req, res, next) => {
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

// DELETE /:blogId/comments/:commentId: Elimina un commento
postRouter.delete('/:blogId/comments/:commentId', async (req, res, next) => {
    try {
        const deletedComment = await Comment.findByIdAndDelete(req.params.commentId); // Elimina il commento
        if (!deletedComment) {
            return next(createError(404, "Commento non trovato"));
        }
        await Blog.findByIdAndUpdate(req.params.blogId, { $pull: { comments: req.params.commentId } }); // Rimuovi il commento dall'array del blog
        res.send({ message: "Commento eliminato con successo" });
    } catch (error) {
        next(error);
    }
});
export default postRouter;
