import axios from 'axios';
import { IBooking, IBookingRequest } from '../interface/booking.interface';
import { BookingRepository } from '../repository/booking.repository';
import { IStatus } from '../types/booking.types';
import { AIRLINE_BOOKING_QUEUE_NAME, AIRLINE_BOOKING_QUEUE_URL, AIRLINE_SEARCH_API_KEY } from '../config/env.config';
import { publishToQueue } from '../queue/rabbitmq.queue';
import { IFlightWithDetails } from '../interface/flight.interface';
import { ApiError } from '../util/api.util';

export class BookingService {
  private bookingRepository: BookingRepository;

  constructor() {
    this.bookingRepository = new BookingRepository();
  }

  async createBooking(user_id: string, data: Omit<IBookingRequest, 'total_price'>[]): Promise<void> {
    const map = new Map<
      string,
      {
        economy: { seats: number; total_price: number };
        premium: { seats: number; total_price: number };
        business: { seats: number; total_price: number };
      }
    >();
    data.forEach((bookingData) => {
      if (!map.has(bookingData.flight_id)) {
        map.set(bookingData.flight_id, {
          economy: { seats: 0, total_price: 0 },
          premium: { seats: 0, total_price: 0 },
          business: { seats: 0, total_price: 0 },
        });
      }
      const seatType = bookingData.seat_type;
      map.get(bookingData.flight_id)![seatType].seats++;
    });
    for (const [flightId, value] of map.entries()) {
      const flightDetails = await axios.get(`${AIRLINE_SEARCH_API_KEY}/flight/${flightId}`);
      if (!flightDetails) {
        throw new ApiError(404, 'Flight not found');
      }
      const flightData: IFlightWithDetails = flightDetails.data.data;
      if (
        flightData.class_window_price.economy.first_window_seats +
          flightData.class_window_price.economy.second_window_seats +
          flightData.class_window_price.economy.third_window_seats <
          value.economy.seats ||
        flightData.class_window_price.premium.first_window_seats +
          flightData.class_window_price.premium.second_window_seats <
          value.premium.seats ||
        flightData.class_window_price.business.first_window_seats +
          flightData.class_window_price.business.second_window_seats <
          value.business.seats
      ) {
        throw new ApiError(400, 'Not enough seats available');
      }
      if (value.economy.seats > 0) {
        if (flightData.class_window_price.economy.first_window_seats > 0) {
          value.economy.total_price = flightData.price * flightData.class_window_price.economy.first_window_percentage;
        } else if (flightData.class_window_price.economy.second_window_seats > 0) {
          value.economy.total_price = flightData.price * flightData.class_window_price.economy.second_window_percentage;
        } else {
          value.economy.total_price = flightData.price * flightData.class_window_price.economy.third_window_percentage;
        }
      }
      if (value.premium.seats > 0) {
        if (flightData.class_window_price.premium.first_window_seats > 0) {
          value.premium.total_price = flightData.price * flightData.class_window_price.premium.first_window_percentage;
        } else {
          value.premium.total_price = flightData.price * flightData.class_window_price.premium.second_window_percentage;
        }
      }
      if (value.business.seats > 0) {
        if (flightData.class_window_price.business.first_window_seats > 0) {
          value.business.total_price =
            flightData.price * flightData.class_window_price.business.first_window_percentage;
        } else {
          value.premium.total_price =
            flightData.price * flightData.class_window_price.business.second_window_percentage;
        }
      }
    }
    const date = new Date();
    await Promise.all(
      data.map(async (bookingData) => {
        const booking = await this.bookingRepository.createBooking({
          user_id,
          flight_id: bookingData.flight_id,
          total_price: map.get(bookingData.flight_id)![bookingData.seat_type].total_price,
          email: bookingData.email!,
          seat_type: bookingData.seat_type!,
          date,
        });
        await publishToQueue(AIRLINE_BOOKING_QUEUE_URL, AIRLINE_BOOKING_QUEUE_NAME, {
          booking_id: booking.id,
          flight_id: booking.flight_id,
        });
        return booking;
      }),
    );
  }

  async getAllBookings(): Promise<IBooking[]> {
    const bookings = await this.bookingRepository.getAllBookings();
    return bookings;
  }

  async getBookingById(id: string): Promise<IBooking> {
    const booking = await this.bookingRepository.getBookingById(id);
    return booking;
  }

  async updateBookingStatus(id: string, status: IStatus): Promise<IBooking> {
    const booking = await this.bookingRepository.updateBookingStatus(id, status);
    return booking;
  }

  async getBookingsByUserId(userId: string): Promise<IBooking[][]> {
    const bookings = await this.bookingRepository.getBookingsByUserId(userId);
    return bookings;
  }

  async getBookingsForFlight(flightId: string): Promise<IBooking[]> {
    const bookings = await this.bookingRepository.getBookingsForFlight(flightId);
    return bookings;
  }
}
