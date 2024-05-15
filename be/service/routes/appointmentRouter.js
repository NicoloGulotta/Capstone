import { Router } from 'express';
import Appointment from '../models/appointment.model.js'; // Assumi che il modello sia in questa posizione
import { authMiddleware } from '../auth/auth.js';
import createError from 'http-errors';

const appointmentRouter = Router();

// GET /appointments: Ottieni tutti gli appuntamenti dell'utente autenticato
appointmentRouter.get('/', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user._id;
        const appointments = await Appointment.find({ user: userId }).populate('user'); // Popola l'utente associato
        res.json(appointments);
    } catch (error) {
        next(error);
    }
});

// GET /appointments/:appointmentId: Ottieni un appuntamento specifico

// GET /appointments/:appointmentId: Ottieni un appuntamento specifico
appointmentRouter.get('/:appointmentId', authMiddleware, async (req, res, next) => {
    try {
        const appointmentId = req.params.appointmentId;
        const userId = req.user._id; // Ottieni l'ID utente dal token

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return next(createError(400, 'ID appuntamento non valido')); // Messaggio di errore specifico
        }

        const appointment = await Appointment.findById(appointmentId).populate('user');

        if (!appointment) {
            return next(createError(404, 'Appuntamento non trovato'));
        }

        // Verifica se l'utente è autorizzato a visualizzare l'appuntamento
        if (!appointment.user.equals(userId)) {
            return next(createError(403, 'Non sei autorizzato a visualizzare questo appuntamento'));
        }

        res.json(appointment);
    } catch (error) {
        next(createError(500, 'Errore interno del server')); // Messaggio di errore generico
    }
});

// POST /appointments: Crea un nuovo appuntamento
appointmentRouter.post('/', authMiddleware, async (req, res, next) => {
    try {
        const { serviceType, date, notes } = req.body;
        const userId = req.user._id;

        // Validazione dei dati (aggiungi controlli più rigorosi se necessario)
        if (!serviceType || !date) {
            return next(createError(400, 'Tipo di servizio e data sono obbligatori'));
        }

        const appointment = await Appointment.create({ serviceType, date, user: userId, notes });
        res.status(201).json(appointment);
    } catch (error) {
        next(error);
    }
});

// PUT /appointments/:appointmentId: Aggiorna un appuntamento esistente
appointmentRouter.put('/:appointmentId', authMiddleware, async (req, res, next) => {
    try {
        const appointmentId = req.params.appointmentId;
        const userId = req.user._id; // Ottieni l'ID utente dal token
        const { serviceType, date, notes, status } = req.body;

        // Verifica se l'appuntamento esiste
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return next(createError(404, 'Appuntamento non trovato'));
        }

        // Verifica se l'utente è autorizzato a modificare l'appuntamento
        if (!appointment.user.equals(userId)) {
            return next(createError(403, 'Non sei autorizzato a modificare questo appuntamento'));
        }

        // Validazione dei dati (aggiungi controlli più rigorosi se necessario)
        if (!serviceType || !date) {
            return next(createError(400, 'Tipo di servizio e data sono obbligatori'));
        }

        // Aggiorna l'appuntamento
        appointment.serviceType = serviceType;
        appointment.date = date;
        appointment.notes = notes;
        appointment.status = status;
        await appointment.save();

        res.json(appointment);
    } catch (error) {
        next(error);
    }
});

// DELETE /appointments/:appointmentId: Elimina un appuntamento
appointmentRouter.delete('/:appointmentId', authMiddleware, async (req, res, next) => {
    try {
        const appointmentId = req.params.appointmentId;
        const userId = req.user._id;

        // Verifica se l'appuntamento esiste
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return next(createError(404, 'Appuntamento non trovato'));
        }

        // Verifica se l'utente è autorizzato a eliminare l'appuntamento
        if (!appointment.user.equals(userId)) {
            return next(createError(403, 'Non sei autorizzato a eliminare questo appuntamento'));
        }

        // Elimina l'appuntamento
        await appointment.remove();

        res.json({ message: 'Appuntamento eliminato con successo' });
    } catch (error) {
        next(error);
    }
});

export default appointmentRouter;