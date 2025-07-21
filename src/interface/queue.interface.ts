export interface IReminderQueueData {
  subject: string;
  body: string;
  notification_time: Date;
  reminder_data: {
    flight_number: string;
    from_city: string;
    from_country: string;
    to_city: string;
    to_country: string;
    from_airport_name: string;
    from_airport_code: string;
    to_airport_name: string;
    to_airport_code: string;
    departure_time: string;
    arrival_time: string;
    booking_id: string;
    email: string;
    seat_number: string;
    seat_type: string;
  };
}

export interface IBookingQueueData {
  booking_id: string;
  flight_id: string;
}
