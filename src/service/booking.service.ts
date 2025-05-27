import axios from 'axios';
import { IBooking } from '../interface/booking.interface';
import { BookingRepository } from '../repository/booking.repository';
import { IStatus } from '../types/status.types';
import { AIRLINE_SEARCH_API_KEY } from '../config/env.config';
import { INotification } from '../interface/notification.interface';
import { notificationSubject } from '../util/notificationSubject.util';
import { notificationBody } from '../util/notificationBody.util';
import { publishToQueue } from '../queue/rabbitmq.queue';

export class BookingService {
  private bookingRepository: BookingRepository;

  constructor() {
    this.bookingRepository = new BookingRepository();
  }

  async createBooking(data: {
    user_email: string;
    user_id: string;
    flight_id: string;
    seats: number;
  }): Promise<IBooking> {
    try {
      const flightDetails = await axios.get(`${AIRLINE_SEARCH_API_KEY}/flight/${data.flight_id}`);
      if (!flightDetails) {
        throw new Error('Flight not found');
      }
      const flightData = flightDetails.data;
      if (flightData.airplane.capacity < data.seats) {
        throw new Error('Not enough seats available');
      }
      const booking = await this.bookingRepository.createBooking({
        user_id: data.user_id,
        flight_id: data.flight_id,
        seats: data.seats,
        total_price: flightData.price * data.seats,
        status: 'confirmed',
      });
      await axios.put(`${AIRLINE_SEARCH_API_KEY}/airplanes/capacity/${flightData.airplane.id}`, {
        capacity: flightData.airplane.capacity - data.seats,
      });
      const notificationData: INotification = {
        user_email: data.user_email,
        seats: data.seats,
        total_price: flightData.price * data.seats,
        flight_number: flightData.flight_number,
        departure_time: new Date(flightData.departure_time),
        arrival_time: new Date(flightData.arrival_time),
        airplane_name: flightData.airplane.name,
        departure_airport_name: flightData.departure_airport.name,
        departure_airport_city: flightData.departure_airport.city.name,
        departure_airport_country: flightData.departure_airport.city.country.name,
        arrival_airport_name: flightData.arrival_airport.name,
        arrival_airport_city: flightData.arrival_airport.city.name,
        arrival_airport_country: flightData.arrival_airport.city.country.name,
      };
      const subject = notificationSubject(flightData.flight_number, new Date(flightData.departure_time));
      const body = notificationBody(notificationData);
      const adjustedDate = new Date(flightData.departure_time);
      // 4 hours before
      adjustedDate.setHours(adjustedDate.getHours() - 4);
      publishToQueue({ subject, body, email: data.user_email, notification_time: adjustedDate });
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

  async getBookingsForFlight(flightId: string): Promise<IBooking[]> {
    try {
      const bookings = await this.bookingRepository.getBookingsForFlight(flightId);
      return bookings;
    } catch (error) {
      console.log('Error in BookingService: getBookingsForFlightByDate:', error);
      throw error;
    }
  }
}
