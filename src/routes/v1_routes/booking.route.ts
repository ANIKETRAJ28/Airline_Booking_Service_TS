import { Router } from 'express';
import { BookingController } from '../../controller/booking.controller';

const bookingController = new BookingController();

export const bookingRouter = Router();

bookingRouter.post('/', bookingController.createBooking);
bookingRouter.get('/', bookingController.getAllBookings);
bookingRouter.get('/id/:id', bookingController.getBookingById);
bookingRouter.get('/user/:userId', bookingController.getBookingsByUserId);
bookingRouter.get('/flight', bookingController.getBookingsForFlightByDate);
bookingRouter.put('/:id', bookingController.updateBookingStatus);
