import { INotification } from '../interface/notification.interface';

export function notificationBody(data: INotification): string {
  return `
    <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f6f8;
            padding: 20px;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.05);
          }
          h2 {
            color: #2e8b57;
          }
          .section {
            margin-top: 20px;
            line-height: 1.6;
          }
          .label {
            font-weight: bold;
            color: #555;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #888;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>✅ Booking Confirmation</h2>
          <p>Dear Customer,</p>
          <p>Your flight booking has been successfully confirmed. Please find your flight and booking details below:</p>

          <div class="section">
            <p><span class="label">Flight Number:</span> ${data.flight_number}</p>
            <p><span class="label">Airplane:</span> ${data.airplane_name}</p>
            <p><span class="label">Seats Booked:</span> ${data.seatType}</p>
            <p><span class="label">Total Price:</span> ₹${data.total_price}</p>
          </div>

          <div class="section">
            <h3>🛫 Departure</h3>
            <p><span class="label">Airport:</span> ${data.departure_airport_name}, ${data.departure_airport_city}, ${data.departure_airport_country}</p>
            <p><span class="label">Time:</span> ${data.departure_time.getDate()}/${data.departure_time.getMonth() + 1}/${data.departure_time.getFullYear()} ${data.departure_time.getHours()}:${data.departure_time.getMinutes()}</p>
          </div>

          <div class="section">
            <h3>🛬 Arrival</h3>
            <p><span class="label">Airport:</span> ${data.arrival_airport_name}, ${data.arrival_airport_city}, ${data.arrival_airport_country}</p>
            <p><span class="label">Time:</span> ${data.arrival_time.getDate()}/${data.arrival_time.getMonth() + 1}/${data.arrival_time.getFullYear()} ${data.arrival_time.getHours()}:${data.arrival_time.getMinutes()}</p>
          </div>

          <p>Please carry a valid ID and arrive at the airport at least 2 hours prior to departure.</p>
          <p>We look forward to having you on board. Safe travels!</p>

          <div class="footer">
            This confirmation was sent to ${data.user_email}.  
            <br />SkyWings Airlines © 2025
          </div>
        </div>
      </body>
      </html>
  `;
}
