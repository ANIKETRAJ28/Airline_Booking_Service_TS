export function notificationSubject(flight_number: string, departure_time: Date): string {
  return `Booking Confirmed: Flight ${flight_number} on ${departure_time.getDate()}/${departure_time.getMonth() + 1}/${departure_time.getFullYear()} ${departure_time.getHours()}:${departure_time.getMinutes()}`;
}
