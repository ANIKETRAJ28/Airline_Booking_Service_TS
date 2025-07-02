import { Request, Response } from 'express';
import { BookingService } from '../service/booking.service';
import { IStatus } from '../types/booking.types';
import { IBookingRequest } from '../interface/booking.interface';
import { ApiError } from '../util/api.util';
import { apiHandler, errorHandler } from '../util/apiHandler.util';

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  createBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id } = req;
      if (!user_id) {
        throw new ApiError(401, 'Unauthorized');
      }
      const data: (Omit<IBookingRequest, 'total_price'> & { flight_id: string })[] = req.body;
      if (!data) {
        throw new ApiError(400, 'Flight ID and booking data are required');
      }
      const booking = await this.bookingService.createBooking(user_id, data);
      apiHandler(res, 201, 'Booking created successfully', booking);
    } catch (error) {
      errorHandler(error, res);
    }
  };

  getAllBookings = async (_req: Request, res: Response): Promise<void> => {
    try {
      const bookings = await this.bookingService.getAllBookings();
      apiHandler(res, 200, 'Bookings retrieved successfully', bookings);
    } catch (error) {
      errorHandler(error, res);
    }
  };

  getBookingById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      if (!id) {
        throw new ApiError(400, 'Booking ID is required');
      }
      const booking = await this.bookingService.getBookingById(id);
      if (!booking) {
        throw new ApiError(404, 'Booking not found');
      }
      apiHandler(res, 200, 'Booking fetched successfully', booking);
    } catch (error) {
      errorHandler(error, res);
    }
  };

  updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      if (!id) {
        throw new ApiError(400, 'Booking ID is required');
      }
      const status: IStatus = req.body.status;
      if (!status) {
        throw new ApiError(400, 'Booking status is required');
      }
      const booking = await this.bookingService.updateBookingStatus(id, status);
      apiHandler(res, 200, 'Booking status updated successfully', booking);
    } catch (error) {
      errorHandler(error, res);
    }
  };

  getBookingsByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user_id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      const bookings = await this.bookingService.getBookingsByUserId(userId);
      apiHandler(res, 200, 'Bookings fetched successfully', bookings);
    } catch (error) {
      errorHandler(error, res);
    }
  };

  getBookingsForFlight = async (req: Request, res: Response): Promise<void> => {
    try {
      const flight_id = req.params.flight_id;
      if (!flight_id) {
        throw new ApiError(400, 'Flight ID is required');
      }
      const bookings = await this.bookingService.getBookingsForFlight(flight_id as string);
      apiHandler(res, 200, 'Bookings for flight fetched successfully', bookings);
    } catch (error) {
      errorHandler(error, res);
    }
  };
}
