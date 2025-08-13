import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware'
import { createAvailability, getAvailableAppointments, bookAppointment, getMyAppointments, cancelAppointment } from './../controllers/appointmentController';

const router = express.Router();



router.post('/availability', authMiddleware, createAvailability)

router.get('/available/:id', authMiddleware, getAvailableAppointments)

router.put('/book/:id', authMiddleware, bookAppointment)

router.put('/cancel/:id', authMiddleware, cancelAppointment)

router.get('/my', authMiddleware, getMyAppointments)




export default router;