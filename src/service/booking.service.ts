import { IBooking } from '../interface/booking.interface';
import { BookingRepository } from '../repository/booking.repository';
import { IStatus } from '../types/status.types';

export class BookingService {
  private bookingRepository: BookingRepository;

  constructor() {
    this.bookingRepository = new BookingRepository();
  }

  async createBooking(data: IBooking): Promise<IBooking> {
    try {
      const booking = await this.bookingRepository.createBooking(data);
      return booking;
    } catch (error) {
      console.log('Error in BookingService: createBooking:', error);
      throw error;
    }
  }

  async getAllBookings(): Promise<IBooking[]> {
    try {
      const bookings = await this.bookingRepository.getAllBookings();
      return bookings;
    } catch (error) {
      console.log('Error in BookingService: getAllBookings:', error);
      throw error;
    }
  }

  async getBookingById(id: string): Promise<IBooking> {
    try {
      const booking = await this.bookingRepository.getBookingById(id);
      return booking;
    } catch (error) {
      console.log('Error in BookingService: getBookingById:', error);
      throw error;
    }
  }

  async updateBookingStatus(id: string, status: IStatus): Promise<IBooking> {
    try {
      const booking = await this.bookingRepository.updateBookingStatus(id, status);
      return booking;
    } catch (error) {
      console.log('Error in BookingService: updateBookingStatus:', error);
      throw error;
    }
  }

  async getBookingsByUserId(userId: string): Promise<IBooking[]> {
    try {
      const bookings = await this.bookingRepository.getBookingsByUserId(userId);
      return bookings;
    } catch (error) {
      console.log('Error in BookingService: getBookingByUserId:', error);
      throw error;
    }
  }

  async getBookingsForFlightByDate(flightId: string, date: Date): Promise<IBooking[]> {
    try {
      const bookings = await this.bookingRepository.getBookingsForFlightByDate(flightId, date);
      return bookings;
    } catch (error) {
      console.log('Error in BookingService: getBookingsForFlightByDate:', error);
      throw error;
    }
  }
}
