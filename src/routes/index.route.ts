import { Router } from 'express';
import { bookingRouter } from './v1_routes/booking.route';
import { jwtMiddleware } from '../middleware/auth.middleware';

export const router = Router();

router.use('/booking', jwtMiddleware, bookingRouter);
