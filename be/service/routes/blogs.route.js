import { Router } from "express";
import { config } from 'dotenv';
import Blog from "../models/blog.model.js";
import Comment from "../models/comment.model.js";
import blogCover from "../middlewares/blogCover.js";
import createError from 'http-errors'; // Importa la funzione per creare errori personalizzati

config(); // Carica le variabili d'ambiente dal file .env

export const blogsRoute = Router(); // Crea un router per le route dei blog

// GET /: Ottieni tutti i blog
blogsRoute.get('/', async (req, res, next) => {
    try {
        const blogs = await Blog.find().populate(["author", "comments"]); // Trova tutti i blog e popola i campi 'author' e 'comments'
        res.send(blogs); // Invia i blog come risposta
    } catch (error) {
        next(error); // Passa l'errore al middleware di gestione degli errori
    }
});

// GET /:id: Ottieni un blog specifico tramite ID
blogsRoute.get('/:id', async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id); // Trova il blog tramite l'ID passato come parametro
        if (!blog) {
            return next(createError(404, "Blog non trovato")); // Se il blog non esiste, crea un errore 404
        }
        res.send(blog); // Invia il blog come risposta
    } catch (error) {
        next(error);
    }
});

// PUT /:id: Aggiorna un blog esistente
blogsRoute.put('/:id', async (req, res, next) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true }); // Aggiorna il blog con i dati nel corpo della richiesta
        if (!blog) {
            return next(createError(404, "Blog non trovato"));
        }
        res.send(blog);
    } catch (error) {
        next(error);
    }
});

// DELETE /:id: Elimina un blog
blogsRoute.delete('/:id', async (req, res, next) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id); // Elimina il blog tramite ID
        if (!blog) {
            return next(createError(404, "Blog non trovato"));
        }
        res.send(blog);
    } catch (error) {
        next(error);
    }
});

// POST /: Crea un nuovo blog (richiede il middleware blogCover per gestire l'immagine di copertina)
blogsRoute.post('/', blogCover, async (req, res, next) => {
    try {
        const data = req.body.data ? JSON.parse(req.body.data) : req.body; // Prendi i dati dal corpo della richiesta
        const post = await Blog.create({ ...data, cover: req.file?.path }); // Crea un nuovo blog con i dati e l'immagine di copertina (se presente)
        res.status(201).send(post); // Invia il nuovo blog con lo stato 201 Created
    } catch (error) {
        next(error);
    }
});

// PATCH /:blogId/cover: Aggiorna l'immagine di copertina di un blog
blogsRoute.patch('/:blogId/cover', blogCover, async (req, res, next) => {
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.blogId,
            { cover: req.file.path },
            { new: true }
        );
        if (!updatedBlog) {
            return next(createError(404, "Blog non trovato"));
        }
        res.send(updatedBlog);
    } catch (error) {
        next(error);
    }
});

// POST /:blogId/comments: Aggiungi un commento a un blog
blogsRoute.post('/:blogId/comments', async (req, res, next) => {
    try {
        const comment = await Comment.create(req.body); // Crea un nuovo commento
        const blog = await Blog.findByIdAndUpdate(
            req.params.blogId,
            { $push: { comments: comment._id } }, // Aggiungi l'ID del commento all'array dei commenti del blog
            { new: true }
        ).populate("comments"); // Popola i commenti per ottenere tutte le informazioni
        if (!blog) {
            return next(createError(404, "Blog non trovato"));
        }
        res.send(blog);
    } catch (error) {
        next(error);
    }
});

// PUT /:blogId/comments/:commentId: Aggiorna un commento esistente
blogsRoute.put('/:blogId/comments/:commentId', async (req, res, next) => {
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
blogsRoute.delete('/:blogId/comments/:commentId', async (req, res, next) => {
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
