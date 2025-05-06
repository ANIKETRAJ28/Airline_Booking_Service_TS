import { IStatus } from '../types/status.types';

export interface IBookingRequest {
  user_id: string;
  flight_id: string;
  seats: number;
  total_price: number;
  status: IStatus;
}

export interface IBooking extends IBookingRequest {
  id: string;
  created_at: Date;
  updated_at: Date;
}
