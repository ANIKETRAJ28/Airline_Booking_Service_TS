import { ISeat } from '../types/booking.types';

export interface INotification {
  user_email: string;
  seatType: ISeat;
  total_price: number;
  flight_number: string;
  departure_time: Date;
  arrival_time: Date;
  airplane_name: string;
  departure_airport_name: string;
  departure_airport_city: string;
  departure_airport_country: string;
  arrival_airport_name: string;
  arrival_airport_city: string;
  arrival_airport_country: string;
}
