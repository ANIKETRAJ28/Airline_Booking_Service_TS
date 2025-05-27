import { Router } from 'express';
import { BookingController } from '../../controller/booking.controller';
import { checkAdminRole, checkSuperAdminRole, jwtMiddleware } from '../../middleware/auth.middleware';

const bookingController = new BookingController();

export const bookingRouter = Router();

bookingRouter.post('/', jwtMiddleware, bookingController.createBooking);
bookingRouter.get('/', jwtMiddleware, checkAdminRole, bookingController.getAllBookings);
bookingRouter.get('/id/:id', jwtMiddleware, checkAdminRole, bookingController.getBookingById);
bookingRouter.get('/user', jwtMiddleware, bookingController.getBookingsByUserId);
bookingRouter.get('/flight/:flight_id', jwtMiddleware, checkAdminRole, bookingController.getBookingsForFlight);
bookingRouter.put('/id/:id', jwtMiddleware, checkSuperAdminRole, bookingController.updateBookingStatus);
