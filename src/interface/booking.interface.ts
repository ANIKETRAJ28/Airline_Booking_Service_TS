import { IStatus } from '../types/status.types';

export interface IBooking {
  id: string;
  user_id: string;
  flight_id: string;
  status: IStatus;
  seats: number;
  total_price: number;
  created_at: Date;
  updated_at: Date;
}
