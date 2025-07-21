export function notificationSubject(flight_number: string, departure_time: string): string {
  return `Booking Confirmed: Flight ${flight_number} on ${new Date(departure_time).toISOString().slice(11, 16)}, ${new Date(
    departure_time,
  ).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })}`;
}
