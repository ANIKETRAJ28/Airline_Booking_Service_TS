import { Router } from 'express';
import { bookingRouter } from './v1_routes/booking.route';

export const router = Router();

router.use('/booking', bookingRouter);
