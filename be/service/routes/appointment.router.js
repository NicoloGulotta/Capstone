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
            .populate('serviceType', 'name price duration')
            .sort({ date: 1 });
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
            .populate('user', 'name email')
            .populate('serviceType', 'name price duration');

        if (!appointment) {
            return res.status(404).json({ message: 'Appuntamento non trovato.' });
        }

        // // Verifica che l'utente sia autorizzato
        // if (appointment.user.toString() !== req.user._id.toString()) {
        //     return res.status(403).json({ message: 'Non sei autorizzato a visualizzare questo appuntamento.' });
        // }

        res.json(appointment);
    } catch (error) {
        next(error);
    }
});

// POST /appointments: Crea un nuovo appuntamento
appointmentRouter.post('/', authMiddleware, async (req, res, next) => {
    try {
        const { serviceType, date, notes } = req.body;
        const userId = req.user._id;

        // Validazione dell'input
        if (!serviceType || !date) {
            return res.status(400).json({ message: 'Parametri mancanti: serviceType, date.' });
        }

        if (!mongoose.Types.ObjectId.isValid(serviceType)) {
            return res.status(400).json({ message: 'serviceType non è un ObjectId valido.' });
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
        await User.findByIdAndUpdate(userId, { $push: { appointments: savedAppointment._id } });

        // Risposta di successo: restituisci l'appuntamento completo con i dati popolati
        const populatedAppointment = await Appointment.findById(savedAppointment._id)
            .populate('serviceType', 'name price duration');
        res.status(201).json(populatedAppointment);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        } else if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID utente o ID servizio non valido.' });
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
        if (serviceType) {
            if (!mongoose.Types.ObjectId.isValid(serviceType)) {
                return res.status(400).json({ message: 'ID serviceType non valido.' });
            }

            // Verifica l'esistenza del serviceType nel database
            const existingServiceType = await ServiceType.findById(serviceType);
            if (!existingServiceType) {
                return res.status(404).json({ message: 'Tipo di servizio non trovato.' });
            }
        }

        // 5. Aggiornamento dei campi dell'appuntamento
        appointment.date = date || appointment.date;
        appointment.notes = notes || appointment.notes;
        appointment.status = status || appointment.status;
        if (serviceType) {
            appointment.serviceType = serviceType;
        }

        // 6. Salvataggio dell'appuntamento aggiornato
        const updatedAppointment = await appointment.save();

        // 7. Popolamento dei campi (opzionale)
        await updatedAppointment
            .populate('user', 'name email')
            .populate('serviceType', 'name price duration')
            .execPopulate();

        // 8. Risposta al client
        res.json(updatedAppointment);
    } catch (error) {
        next(error); // Gestione degli errori centralizzata
    }
});


// DELETE /appointments/:id: Elimina un appuntamento
appointmentRouter.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
        const appointmentId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ message: 'ID appuntamento non valido.' });
        }

        const deletedAppointment = await Appointment.findByIdAndDelete(appointmentId);
        if (!deletedAppointment) {
            return res.status(404).json({ message: 'Appuntamento non trovato.' });
        }

        // Verifica che l'utente sia autorizzato
        if (deletedAppointment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Non sei autorizzato a eliminare questo appuntamento.' });
        }

        res.json({ message: 'Appuntamento eliminato con successo.' });
    } catch (error) {
        next(error);
    }
});

export default appointmentRouter;
