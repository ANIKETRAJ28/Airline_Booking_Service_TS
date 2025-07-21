import { formatDuration } from './formatDuration.util';

export const notificationBody = (
  flight: {
    flight_number: string;
    from_city: string;
    from_country: string;
    from_airport_name: string;
    from_airport_code: string;
    to_city: string;
    to_country: string;
    to_airport_name: string;
    to_airport_code: string;
    departure_time: string;
    arrival_time: string;
  },
  passenger: { email: string; seat_number: string; class: string; price: number; booking_id: string },
): string => {
  return `
  <!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8" />
  <title>Booking Confirmation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background-color: #f3f4f6;
      margin: 0;
      padding: 20px;
      color: #1f2937;
    }

    .container {
      max-width: 700px;
      margin: auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .header {
      background-color: #f97316;
      color: white;
      padding: 24px;
      text-align: center;
    }

    .section {
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .section:last-child {
      border-bottom: none;
    }

    .card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;
      background-color: #f9fafb;
    }

    .label {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
    }

    .value {
      font-size: 16px;
      font-weight: 500;
      color: #111827;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #9ca3af;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="header">
      <h1>Booking Confirmed</h1>
      <p>Your reservation is successful. Below are your flight details.</p>
    </div>

    <div class="section">
      <h2>Flight Information</h2>
      <div class="card grid">
        <div>
          <div class="label">Flight Number</div>
          <div class="value">${flight.flight_number}</div>
        </div>
        <div>
          <div class="label">Duration</div>
          <div class="value">${formatDuration(flight.departure_time, flight.arrival_time)}</div>
        </div>
        <div>
          <div class="label">From</div>
          <div class="value">${flight.from_city}, ${flight.from_city}</div>
        </div>
        <div>
          <div class="label">To</div>
          <div class="value">${flight.to_city}, ${flight.to_country}</div>
        </div>
        <div>
          <div class="label">Departure Airport</div>
          <div class="value">${flight.from_airport_name} (${flight.from_airport_code})</div>
        </div>
        <div>
          <div class="label">Arrival Airport</div>
          <div class="value">${flight.to_airport_name} (${flight.to_airport_code})</div>
        </div>
        <div>
          <div class="label">Departure</div>
          <div class="value">${new Date(flight.departure_time).toISOString().slice(11, 16)}, ${new Date(
            flight.departure_time,
          ).toLocaleDateString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}</div>
        </div>
        <div>
          <div class="label">Arrival</div>
          <div class="value">${new Date(flight.arrival_time).toISOString().slice(11, 16)}, ${new Date(
            flight.arrival_time,
          ).toLocaleDateString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Passenger Details</h2>
      <div class="card grid">
        <div>
          <div class="label">Email</div>
          <div class="value">${passenger.email}</div>
        </div>
        <div>
          <div class="label">Seat</div>
          <div class="value">${passenger.seat_number}</div>
        </div>
        <div>
          <div class="label">Class</div>
          <div class="value">${passenger.class.charAt(0).toUpperCase + passenger.class.slice(1)}</div>
        </div>
        <div>
          <div class="label">Price</div>
          <div class="value">₹${passenger.price}</div>
        </div>
        <div>
          <div class="label">Booking ID</div>
          <div class="value">${passenger.booking_id}</div>
        </div>
      </div>
    </div>

    <div class="footer">
      Sky Wings Airlines Pvt. Ltd. <br />
      &copy; 2025 All rights reserved.
    </div>
  </div>
</body>

</html>`;
};
