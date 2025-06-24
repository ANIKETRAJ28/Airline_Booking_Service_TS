export interface IReminderQueueData {
  subject: string;
  body: string;
  notification_time: Date;
  email: string;
}

export interface IBookingQueueData {
  booking_id: string;
  flight_id: string;
}
