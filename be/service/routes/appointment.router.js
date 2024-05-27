import { Router } from 'express';
import Appointment from '../models/appointment.model.js';
import { authMiddleware } from '../auth/auth.js';
import createError from 'http-errors';
import mongoose from 'mongoose';
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
// GET /appointments/:id: Ottieni un singolo appuntamento
appointmentRouter.get('/:id', authMiddleware, async (req, res, next) => {
    try {
        const appointmentId = req.params.id;

        // Verifica se appointmentId è un ObjectId valido
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ message: 'ID appuntamento non valido.' });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appuntamento non trovato.' });
        }

        res.json(appointment);
    } catch (error) {
        next(error);
    }
});

// POST /appointments: Crea un nuovo appuntamento
appointmentRouter.post('/', authMiddleware, async (req, res, next) => {
    try {
        const { serviceType, date, notes } = req.body;
        const userId = req.user._id; // Ottieni l'ID utente dall'autenticazione

        // 1. Validazione dell'input (puoi aggiungere ulteriori controlli se necessario)
        if (!serviceType || !date) {
            return res.status(400).json({ message: 'Parametri mancanti: serviceType, date.' });
        }

        // Verifica ObjectId e data
        if (!mongoose.Types.ObjectId.isValid(serviceType)) {
            return res.status(400).json({ message: 'serviceType non è un ObjectId valido.' });
        }
        if (isNaN(Date.parse(date))) {
            return res.status(400).json({ message: 'Formato data non valido.' });
        }


        // 2. Creazione dell'appuntamento
        const newAppointment = new Appointment({
            serviceType,
            date,
            user: userId,
            notes,
            status: 'In attesa',
        });

        const savedAppointment = await newAppointment.save();

        // 3. Aggiorna l'utente con il nuovo appuntamento
        await User.findByIdAndUpdate(userId, { $push: { appointments: savedAppointment._id } });

        // 4. Risposta di successo:
        res.status(201).json(savedAppointment);
    } catch (error) {
        // 5. Gestione degli errori
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        } else if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID utente o ID servizio non valido.' });
        }
        next(error); // Passa altri errori al middleware successivo
    }
});

// PUT /appointments/:appointmentId: Aggiorna un appuntamento esistente
appointmentRouter.put('/:id', authMiddleware, async (req, res, next) => {
    try {
        const appointmentId = req.params.id;
        const { date, notes, status } = req.body; // Aggiorna solo i campi consentiti

        // Verifica se appointmentId è un ObjectId valido
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ message: 'ID appuntamento non valido.' });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { date, notes, status },
            { new: true } // Restituisci il documento aggiornato
        );

        if (!appointment) {
            return res.status(404).json({ message: 'Appuntamento non trovato.' });
        }

        res.json(appointment);
    } catch (error) {
        next(error);
    }
});


// DELETE /appointments/:appointmentId: Elimina un appuntamento
appointmentRouter.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
        const appointmentId = req.params.id;

        // Verifica se appointmentId è un ObjectId valido
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ message: 'ID appuntamento non valido.' });
        }

        const deletedAppointment = await Appointment.findByIdAndRemove(appointmentId);
        if (!deletedAppointment) {
            return res.status(404).json({ message: 'Appuntamento non trovato.' });
        }

        res.json({ message: 'Appuntamento eliminato con successo.' });
    } catch (error) {
        next(error);
    }
});


export default appointmentRouter;