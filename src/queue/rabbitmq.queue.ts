import amqp from 'amqplib/callback_api';
import { AIRLINE_MESSAGE_QUEUE_NAME, AIRLINE_MESSAGE_QUEUE_URL } from '../config/env.config';
import { IQueue } from '../interface/queue.interface';

export async function publishToQueue(data: IQueue): Promise<void> {
  try {
    // create a connection to RabbitMQ
    amqp.connect(AIRLINE_MESSAGE_QUEUE_URL, (error, connection) => {
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
        const queue = AIRLINE_MESSAGE_QUEUE_NAME;
        // create a queue if it doesn't exist and durable is set to true to ensure the queue survives a broker restart
        channel.assertQueue(queue, { durable: true });
        // assert an exchange with the same name and type "direct" and durable is set to true to ensure the queue survives a broker restart
        channel.assertExchange(queue, 'direct', { durable: true });
        channel.publish(queue, queue, Buffer.from(JSON.stringify(data)));
      });
      // Close the connection after publishing the message
      setTimeout(() => {
        connection.close();
      }, 500);
    });
  } catch (error) {
    console.error('Error publishing to RabbitMQ:', error);
  }
}
