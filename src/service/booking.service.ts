import axios from 'axios';
import {
  IBooking,
  IBookingRequest,
  IBookingWithDetailsForAdmin,
  IBookingWithDetailsForUser,
} from '../interface/booking.interface';
import { BookingRepository } from '../repository/booking.repository';
import { IStatus } from '../types/booking.types';
import {
  AIRLINE_AUTH_API_KEY,
  AIRLINE_BOOKING_QUEUE_NAME,
  AIRLINE_BOOKING_QUEUE_URL,
  AIRLINE_SEARCH_API_KEY,
} from '../config/env.config';
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
      const flightsForFlightByUser = await this.bookingRepository.getBookingsByFlightIdAndUserId(flightId, user_id);
      if (flightsForFlightByUser.length + value.economy.seats + value.premium.seats + value.business.seats > 5) {
        throw new ApiError(400, `You can only book a maximum of 5 seats for flight ${flightData.flight_number}`);
      }
      const { business, economy, premium } = flightData.class_window_price;
      if (
        economy.first_window_remaining_seats +
          economy.second_window_remaining_seats +
          economy.third_window_remaining_seats <
          value.economy.seats ||
        premium.first_window_remaining_seats + premium.second_window_remaining_seats < value.premium.seats ||
        business.first_window_remaining_seats + business.second_window_remaining_seats < value.business.seats
      ) {
        throw new ApiError(400, 'Not enough seats available');
      }
      if (value.economy.seats > 0) {
        if (economy.first_window_remaining_seats > 0) {
          value.economy.total_price = flightData.price * economy.first_window_percentage;
        } else if (economy.second_window_remaining_seats > 0) {
          value.economy.total_price = flightData.price * economy.second_window_percentage;
        } else {
          value.economy.total_price = flightData.price * economy.third_window_percentage;
        }
      }
      if (value.premium.seats > 0) {
        if (premium.first_window_remaining_seats > 0) {
          value.premium.total_price = flightData.price * premium.first_window_percentage;
        } else {
          value.premium.total_price = flightData.price * premium.second_window_percentage;
        }
      }
      if (value.business.seats > 0) {
        if (business.first_window_remaining_seats > 0) {
          value.business.total_price = flightData.price * business.first_window_percentage;
        } else {
          value.business.total_price = flightData.price * business.second_window_percentage;
        }
      }
    }
    await Promise.all(
      data.map(async (bookingData) => {
        const flightId = bookingData.flight_id;
        const seatNumber = bookingData.seat_number;
        const flightByFlightIdAndSeatNumber = await this.bookingRepository.getBookingByFlightIdAndSeatNumber(
          flightId,
          seatNumber,
        );
        if (flightByFlightIdAndSeatNumber) {
          throw new ApiError(400, 'Seat already booked');
        }
      }),
    );
    const date = new Date();
    await Promise.all(
      data.map(async (bookingData) => {
        const booking = await this.bookingRepository.createBooking({
          user_id,
          flight_id: bookingData.flight_id,
          total_price: map.get(bookingData.flight_id)![bookingData.seat_type].total_price,
          email: bookingData.email!,
          seat_type: bookingData.seat_type!,
          seat_number: bookingData.seat_number!,
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

  async getAllBookings(limit: number, offset: number): Promise<IBooking[]> {
    const bookings = await this.bookingRepository.getAllBookings(limit, offset);
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

  async getBookingsByUserId(userId: string): Promise<IBookingWithDetailsForUser[][]> {
    const bookings: IBooking[] = await this.bookingRepository.getBookingsByUserId(userId);
    // Step 1: Group bookings by created_at timestamp
    const bookingsByTime = new Map<string, IBooking[]>();
    for (const booking of bookings) {
      const timestamp = booking.created_at.toISOString();
      if (!bookingsByTime.has(timestamp)) {
        bookingsByTime.set(timestamp, []);
      }
      bookingsByTime.get(timestamp)!.push(booking);
    }
    // Step 2: Further group by flight_id within each timestamp
    const bookingsByTimeAndFlight = new Map<string, Map<string, Omit<IBooking, 'flight_id'>[]>>();
    for (const [timestamp, bookingList] of bookingsByTime.entries()) {
      const flightMap = new Map<string, Omit<IBooking, 'flight_id'>[]>();
      for (const booking of bookingList) {
        if (!flightMap.has(booking.flight_id)) {
          flightMap.set(booking.flight_id, []);
        }
        flightMap.get(booking.flight_id)!.push({
          id: booking.id,
          user_id: booking.user_id,
          email: booking.email,
          seat_type: booking.seat_type,
          seat_number: booking.seat_number,
          status: booking.status,
          created_at: booking.created_at,
          updated_at: booking.updated_at,
          total_price: booking.total_price,
        });
      }
      bookingsByTimeAndFlight.set(timestamp, flightMap);
    }
    // Step 3: Resolve all flight data and structure result
    const groupedBookings: IBookingWithDetailsForUser[][] = [];

    for (const [, flightMap] of bookingsByTimeAndFlight.entries()) {
      const group: IBookingWithDetailsForUser[] = [];

      for (const [flightId, bookings] of flightMap.entries()) {
        const flightRes = await axios.get(`${AIRLINE_SEARCH_API_KEY}/flight/${flightId}`);
        if (!flightRes?.data?.data) {
          throw new ApiError(404, 'Flight not found');
        }
        const flightData: IFlightWithDetails = flightRes.data.data;
        group.push({
          flight: {
            id: flightData.id,
            flight_number: flightData.flight_number,
            status: flightData.status,
            departure_time: flightData.departure_time,
            arrival_time: flightData.arrival_time,
            created_at: flightData.created_at,
            updated_at: flightData.updated_at,
            departure_airport: {
              id: flightData.departure_airport.id,
              name: flightData.departure_airport.name,
              code: flightData.departure_airport.code,
              city: {
                id: flightData.departure_airport.city.id,
                name: flightData.departure_airport.city.name,
                country: {
                  id: flightData.departure_airport.city.country.id,
                  name: flightData.departure_airport.city.country.name,
                  created_at: flightData.departure_airport.city.country.created_at,
                  updated_at: flightData.departure_airport.city.country.updated_at,
                },
                created_at: flightData.departure_airport.city.created_at,
                updated_at: flightData.departure_airport.city.updated_at,
              },
              created_at: flightData.departure_airport.created_at,
              updated_at: flightData.departure_airport.updated_at,
            },
            arrival_airport: {
              id: flightData.arrival_airport.id,
              name: flightData.arrival_airport.name,
              code: flightData.arrival_airport.code,
              city: {
                id: flightData.arrival_airport.city.id,
                name: flightData.arrival_airport.city.name,
                country: {
                  id: flightData.arrival_airport.city.country.id,
                  name: flightData.arrival_airport.city.country.name,
                  created_at: flightData.arrival_airport.city.country.created_at,
                  updated_at: flightData.arrival_airport.city.country.updated_at,
                },
                created_at: flightData.arrival_airport.city.created_at,
                updated_at: flightData.arrival_airport.city.updated_at,
              },
              created_at: flightData.arrival_airport.created_at,
              updated_at: flightData.arrival_airport.updated_at,
            },
            airplane: {
              id: flightData.airplane.id,
              name: flightData.airplane.name,
              code: flightData.airplane.code,
              created_at: flightData.airplane.created_at,
              updated_at: flightData.airplane.updated_at,
            },
          },
          bookings,
        });
      }
      group.sort((a, b) => a.flight.departure_time.getTime() - b.flight.departure_time.getTime());
      groupedBookings.push(group);
    }
    return groupedBookings;
  }

  async getBookingsForFlight(flightId: string): Promise<IBookingWithDetailsForAdmin> {
    const bookings = await this.bookingRepository.getBookingsForFlight(flightId);
    const flightRes = await axios.get(`${AIRLINE_SEARCH_API_KEY}/flight/${flightId}`);
    if (!flightRes?.data?.data) {
      throw new ApiError(404, 'Flight not found');
    }
    const flightData: IFlightWithDetails = flightRes.data.data;
    const bookingsWithDetail = await Promise.all(
      bookings.map(
        async (
          booking,
        ): Promise<
          Omit<IBooking, 'user_id' | 'email' | 'flight_id'> & {
            booking_email: string;
            user_email: string;
          }
        > => {
          const userRes = await axios.get(`${AIRLINE_AUTH_API_KEY}/user/id/${booking.user_id}`);
          if (!userRes?.data?.data) {
            throw new ApiError(404, 'User not found');
          }
          const userData = userRes.data.data;
          return {
            id: booking.id,
            seat_number: booking.seat_number,
            seat_type: booking.seat_type,
            total_price: booking.total_price,
            status: booking.status,
            booking_email: booking.email,
            user_email: userData.email,
            created_at: booking.created_at,
            updated_at: booking.updated_at,
          };
        },
      ),
    );
    return {
      flight: {
        id: flightData.id,
        flight_number: flightData.flight_number,
        status: flightData.status,
        departure_time: flightData.departure_time,
        arrival_time: flightData.arrival_time,
        created_at: flightData.created_at,
        updated_at: flightData.updated_at,
        departure_airport: {
          id: flightData.departure_airport.id,
          name: flightData.departure_airport.name,
          code: flightData.departure_airport.code,
          city: {
            id: flightData.departure_airport.city.id,
            name: flightData.departure_airport.city.name,
            country: {
              id: flightData.departure_airport.city.country.id,
              name: flightData.departure_airport.city.country.name,
              created_at: flightData.departure_airport.city.country.created_at,
              updated_at: flightData.departure_airport.city.country.updated_at,
            },
            created_at: flightData.departure_airport.city.created_at,
            updated_at: flightData.departure_airport.city.updated_at,
          },
          created_at: flightData.departure_airport.created_at,
          updated_at: flightData.departure_airport.updated_at,
        },
        arrival_airport: {
          id: flightData.arrival_airport.id,
          name: flightData.arrival_airport.name,
          code: flightData.arrival_airport.code,
          city: {
            id: flightData.arrival_airport.city.id,
            name: flightData.arrival_airport.city.name,
            country: {
              id: flightData.arrival_airport.city.country.id,
              name: flightData.arrival_airport.city.country.name,
              created_at: flightData.arrival_airport.city.country.created_at,
              updated_at: flightData.arrival_airport.city.country.updated_at,
            },
            created_at: flightData.arrival_airport.city.created_at,
            updated_at: flightData.arrival_airport.city.updated_at,
          },
          created_at: flightData.arrival_airport.created_at,
          updated_at: flightData.arrival_airport.updated_at,
        },
        airplane: {
          id: flightData.airplane.id,
          name: flightData.airplane.name,
          code: flightData.airplane.code,
          business_class_seats: flightData.airplane.business_class_seats,
          premium_class_seats: flightData.airplane.premium_class_seats,
          economy_class_seats: flightData.airplane.economy_class_seats,
          created_at: flightData.airplane.created_at,
          updated_at: flightData.airplane.updated_at,
        },
      },
      bookings: bookingsWithDetail,
    };
  }

  async getBookingsForFlightForUsers(flightId: string): Promise<{ id: string; seat_number: string }[]> {
    return this.bookingRepository.getBookingsForFlightForUsers(flightId);
  }
}
