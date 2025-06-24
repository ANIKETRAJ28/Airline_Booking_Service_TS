import { ISeat } from '../types/booking.types';

export interface IBookingRequest {
  email: string;
  total_price: number;
  seat_type: ISeat;
  flight_id: string;
}

export interface IBooking extends IBookingRequest {
  id: string;
  created_at: Date;
  updated_at: Date;
}
