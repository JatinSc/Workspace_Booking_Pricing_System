import { Router } from 'express';
import { createBooking, cancelBooking, listBookings } from '../controllers/bookingsController.js';
// Bookings API routes now call controllers (HTTP layer) rather than services directly.

const router = Router();

router.post('/create', createBooking);

router.post('/:id/cancel', cancelBooking);

router.get('/', listBookings);

export default router;