import { Router } from 'express';
import Appointment from '../models/appointment.model.js';
import { authMiddleware } from '../auth/auth.js';
import mongoose from 'mongoose';
import User from '../models/user.model.js';

const appointmentRouter = Router();

// GET /appointments: Ottieni tutti gli appuntamenti dell'utente autenticato
appointmentRouter.get('/', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user._id;
        const appointments = await Appointment.find({ user: userId })
            .populate('user', 'name email')
            .sort({ date: 1 }); // Ordina per data
        res.json(appointments);
    } catch (error) {
        next(error);
    }
});

// GET /appointments/:id: Ottieni un singolo appuntamento (dettagliato)
appointmentRouter.get('/:id', authMiddleware, async (req, res, next) => {
    try {
        const appointmentId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ message: 'ID appuntamento non valido.' });
        }

        const appointment = await Appointment.findById(appointmentId)
            .populate('user', 'name email');

        if (!appointment) {
            return res.status(404).json({ message: 'Appuntamento non trovato.' });
        }

        // Verifica che l'utente sia autorizzato
        if (appointment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Non sei autorizzato a visualizzare questo appuntamento.' });
        }

        res.json(appointment);
    } catch (error) {
        next(error);
    }
});

// POST /appointments: Crea un nuovo appuntamento
appointmentRouter.post('/', authMiddleware, async (req, res, next) => {
    try {
        const { serviceType, date, notes } = req.body; // serviceType è ora una stringa, non un ObjectId

        // Validazione dell'input
        if (!serviceType || !date) {
            return res.status(400).json({ message: 'Parametri mancanti: serviceType, date.' });
        }

        if (typeof serviceType !== 'string') { // Verifica che serviceType sia una stringa
            return res.status(400).json({ message: 'serviceType deve essere una stringa.' });
        }
        if (isNaN(Date.parse(date))) {
            return res.status(400).json({ message: 'Formato data non valido.' });
        }

        // Creazione dell'appuntamento
        const newAppointment = new Appointment({
            ...req.body,
            user: req.user._id,
            status: 'In attesa',
        });

        const savedAppointment = await newAppointment.save();

        // Aggiorna l'utente con il nuovo appuntamento
        await User.findByIdAndUpdate(req.user._id, { $push: { appointments: savedAppointment._id } });

        res.status(201).json(savedAppointment); // Invia l'appuntamento appena creato
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
});

// PUT /appointments/:id: Aggiorna un appuntamento esistente
appointmentRouter.put('/:id', authMiddleware, async (req, res, next) => {
    try {
        const appointmentId = req.params.id;
        const { date, notes, status, serviceType } = req.body;

        // 1. Validazione dell'ID dell'appuntamento
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ message: 'ID appuntamento non valido.' });
        }

        // 2. Recupero dell'appuntamento
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appuntamento non trovato.' });
        }

        // 3. Verifica dell'autorizzazione
        if (appointment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Non sei autorizzato a modificare questo appuntamento.' });
        }

        // 4. Validazione del serviceType (se fornito)
        if (serviceType && typeof serviceType !== 'string') {
            return res.status(400).json({ message: 'serviceType deve essere una stringa.' });
        }

        // 5. Aggiornamento dei campi dell'appuntamento
        appointment.date = date || appointment.date;
        appointment.notes = notes || appointment.notes;
        appointment.status = status || appointment.status;
        if (serviceType) {
            appointment.serviceType = serviceType; // serviceType è ora una stringa
        }

        // 6. Salvataggio dell'appuntamento aggiornato
        const updatedAppointment = await appointment.save();
        res.json(updatedAppointment); // Non è necessario ripopolare, abbiamo già tutti i dati

    } catch (error) {
        next(error);
    }
});
// DELETE /appointment/:appointmentId
appointmentRouter.delete("/:appointmentId", authMiddleware, async (req, res, next) => {
    try {
        const appointmentId = req.params.appointmentId;

        // Trova e cancella l'appuntamento
        const deletedAppointment = await Appointment.findByIdAndDelete(appointmentId);

        if (!deletedAppointment) {
            return next(createError(404, "Appuntamento non trovato"));
        }

        // Aggiorna il documento utente rimuovendo l'ID dell'appuntamento cancellato
        await User.findByIdAndUpdate(
            deletedAppointment.user, // ID dell'utente associato all'appuntamento
            { $pull: { appointments: appointmentId } }  // Rimuovi l'ObjectId dall'array
        );

        res.status(204).send(); // 204 No Content (successo senza contenuto da restituire)
    } catch (error) {
        next(error);
    }
});

export default appointmentRouter;
