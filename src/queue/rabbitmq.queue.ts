import amqp from 'amqplib/callback_api';
import { IBookingQueueData, IReminderQueueData } from '../interface/queue.interface';
import {
  AIRLINE_BOOKING_QUEUE_NAME,
  AIRLINE_BOOKING_QUEUE_URL,
  AIRLINE_REMINDER_QUEUE_NAME,
  AIRLINE_REMINDER_QUEUE_URL,
  AIRLINE_SEARCH_API_KEY,
} from '../config/env.config';
import { BookingRepository } from '../repository/booking.repository';
import axios from 'axios';
import { IFlightWithDetails } from '../interface/flight.interface';
import { notificationSubject } from '../util/notificationSubject.util';
import { notificationBody } from '../util/notificationBody.util';
import { ApiError } from '../util/api.util';

export async function publishToQueue(
  queue_url: string,
  queue_name: string,
  data: IBookingQueueData | IReminderQueueData,
): Promise<void> {
  try {
    // create a connection to RabbitMQ
    await amqp.connect(queue_url, (error, connection) => {
      if (error) {
        console.error('Error connecting to RabbitMQ:', error);
        return;
      }
      // create a channel
      connection.createChannel(async (error1, channel) => {
        if (error1) {
          console.error('Error creating channel:', error1);
          return;
        }
        // create a queue if it doesn't exist and durable is set to true to ensure the queue survives a broker restart
        channel.assertQueue(queue_name, { durable: true }, () => {
          // assert an exchange with the same name and type "direct" and durable is set to true to ensure the queue survives a broker restart
          channel.assertExchange(queue_name, 'direct', { durable: true }, () => {
            channel.publish(queue_name, queue_name, Buffer.from(JSON.stringify(data)));
            // Close the connection after publishing the message
            setTimeout(() => {
              connection.close();
            }, 500);
          });
        });
      });
    });
  } catch (error) {
    console.error('Error publishing to RabbitMQ:', error);
  }
}

export async function subscribeToQueue(): Promise<void> {
  try {
    // create a connection to RabbitMQ
    amqp.connect(AIRLINE_BOOKING_QUEUE_URL, (error, connection) => {
      if (error) {
        console.error('Error connecting to RabbitMQ:', error);
        return;
      }
      // create a channel
      connection.createChannel((error1, channel) => {
        if (error1) {
          console.error('Error creating channel:', error1);
          return;
        }
        // assert an exchange with the same name and type "direct" and durable is set to true to ensure the queue survives a broker restart
        channel.assertExchange(AIRLINE_BOOKING_QUEUE_NAME, 'direct', { durable: true });
        // create a queue if it doesn't exist and durable is set to true to ensure the queue survives a broker restart
        channel.assertQueue(AIRLINE_BOOKING_QUEUE_NAME, { durable: true }, (error2, q) => {
          if (error2) {
            console.error('Error asserting queue:', error2);
            return;
          }
          // bind the queue to the exchange with the same name as the queue
          channel.bindQueue(q.queue, AIRLINE_BOOKING_QUEUE_NAME, AIRLINE_BOOKING_QUEUE_NAME);
          const bookingRepository = new BookingRepository();
          channel.consume(q.queue, async (msg) => {
            if (msg?.content) {
              const payload: IBookingQueueData = JSON.parse(msg.content.toString());
              const flightId = payload.flight_id;
              const bookingId = payload.booking_id;
              await bookingRepository.updateBookingStatus(bookingId, 'confirmed');
              const bookingDetails = await bookingRepository.getBookingById(bookingId);
              await axios.put(`${AIRLINE_SEARCH_API_KEY}/flight/${flightId}/seat`, {
                window_type: bookingDetails.seat_type,
                seats: 1,
              });
              const flightDetails = await axios.get(`${AIRLINE_SEARCH_API_KEY}/flight/${flightId}`);
              if (!flightDetails) {
                throw new ApiError(404, 'Flight not found');
              }
              const flightData: IFlightWithDetails = flightDetails.data.data;
              const notificationFlightData = {
                flight_number: flightData.flight_number,
                from_city: flightData.departure_airport.city.name,
                from_country: flightData.departure_airport.city.country.name,
                from_airport_name: flightData.departure_airport.name,
                from_airport_code: flightData.departure_airport.code,
                to_city: flightData.arrival_airport.city.name,
                to_country: flightData.arrival_airport.city.country.name,
                to_airport_name: flightData.arrival_airport.name,
                to_airport_code: flightData.arrival_airport.code,
                departure_time: flightData.departure_time + '',
                arrival_time: flightData.arrival_time + '',
              };
              const notificationPassagerData = {
                email: bookingDetails.email,
                seat_number: bookingDetails.seat_number,
                class: bookingDetails.seat_type as string,
                price: bookingDetails.total_price,
                booking_id: bookingDetails.id,
              };
              const subject = notificationSubject(flightData.flight_number, flightData.departure_time + '');
              const body = notificationBody(notificationFlightData, notificationPassagerData);
              const adjustedDate = new Date(flightData.departure_time);
              // 4 hours before
              adjustedDate.setHours(adjustedDate.getHours() - 4);
              publishToQueue(AIRLINE_REMINDER_QUEUE_URL, AIRLINE_REMINDER_QUEUE_NAME, {
                subject,
                body,
                reminder_data: {
                  arrival_time: flightData.arrival_time + '',
                  booking_id: bookingDetails.id,
                  departure_time: flightData.departure_time + '',
                  flight_number: flightData.flight_number,
                  from_airport_code: flightData.departure_airport.code,
                  from_airport_name: flightData.departure_airport.name,
                  from_city: flightData.departure_airport.city.name,
                  from_country: flightData.departure_airport.city.country.name,
                  to_airport_code: flightData.arrival_airport.code,
                  to_airport_name: flightData.arrival_airport.name,
                  to_city: flightData.arrival_airport.city.name,
                  to_country: flightData.arrival_airport.city.country.name,
                  seat_number: bookingDetails.seat_number,
                  seat_type: bookingDetails.seat_type,
                  email: bookingDetails.email,
                },
                notification_time: adjustedDate,
              });
              channel.ack(msg); // acknowledge the message
            }
          });
        });
      });
    });
  } catch {
    throw new ApiError(500, 'Error subscribing to RabbitMQ queue');
  }
}
