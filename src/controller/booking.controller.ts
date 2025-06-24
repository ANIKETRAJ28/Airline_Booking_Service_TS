import { Request, Response } from 'express';
import { BookingService } from '../service/booking.service';
import { IStatus } from '../types/booking.types';
import { IBookingRequest } from '../interface/booking.interface';

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  createBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req;
      if (!id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const data: (Omit<IBookingRequest, 'total_price'> & { flight_id: string })[] = req.body;
      if (!data) {
        res.status(400).json({ message: 'Flight ID and booking data are required' });
        return;
      }
      const booking = await this.bookingService.createBooking(id, data);
      res.status(201).json(booking);
    } catch (error) {
      console.log('Error in BookingController: createBooking:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  getAllBookings = async (_req: Request, res: Response): Promise<void> => {
    try {
      const bookings = await this.bookingService.getAllBookings();
      res.status(200).json(bookings);
    } catch (error) {
      console.log('Error in BookingController: getAllBookings:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  getBookingById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ message: 'Booking ID is required' });
        return;
      }
      const booking = await this.bookingService.getBookingById(id);
      if (!booking) {
        res.status(404).json({ message: 'Booking not found' });
        return;
      }
      res.status(200).json(booking);
    } catch (error) {
      console.log('Error in BookingController: getBookingById:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ message: 'Booking ID is required' });
        return;
      }
      const status: IStatus = req.body.status;
      if (!status) {
        res.status(400).json({ message: 'Status is required' });
        return;
      }
      const booking = await this.bookingService.updateBookingStatus(id, status);
      if (!booking) {
        res.status(404).json({ message: 'Booking not found' });
        return;
      }
      res.status(200).json(booking);
    } catch (error) {
      console.log('Error in BookingController: updateBookingStatus:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  getBookingsByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.id;
      if (!userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }
      const bookings = await this.bookingService.getBookingsByUserId(userId);
      res.status(200).json(bookings);
    } catch (error) {
      console.log('Error in BookingController: getBookingsByUserId:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  getBookingsForFlight = async (req: Request, res: Response): Promise<void> => {
    try {
      const flight_id = req.params.flight_id;
      if (!flight_id) {
        res.status(400).json({ message: 'Flight ID and date are required' });
        return;
      }
      const bookings = await this.bookingService.getBookingsForFlight(flight_id as string);
      res.status(200).json(bookings);
    } catch (error) {
      console.log('Error in BookingController: getBookingsForFlightByDate:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}
