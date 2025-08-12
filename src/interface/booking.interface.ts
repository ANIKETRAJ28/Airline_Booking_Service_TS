import { ISeat, IStatus } from '../types/booking.types';
import { IFlight } from './flight.interface';

export interface IBookingRequest {
  email: string;
  total_price: number;
  seat_type: ISeat;
  flight_id: string;
  seat_number: string;
}

export interface IBooking extends IBookingRequest {
  id: string;
  user_id: string;
  status: IStatus;
  created_at: Date;
  updated_at: Date;
}

export interface IBookingWithDetailsForUser {
  flight: Omit<IFlight, 'airplane'> & {
    airplane: {
      id: string;
      name: string;
      code: string;
      created_at: Date;
      updated_at: Date;
    };
  };
  bookings: Omit<IBooking, 'flight_id'>[];
}

export interface IBookingWithDetailsForAdmin {
  flight: IFlight;
  bookings: (Omit<IBooking, 'flight_id' | 'user_id' | 'email'> & {
    booking_email: string;
    user_email: string;
  })[];
}
