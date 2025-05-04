import { Pool, PoolClient } from 'pg';
import { getPool } from '../util/dbPool.util';
import { IBooking } from '../interface/booking.interface';
import { IStatus } from '../types/status.types';

export class BookingRepository {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  async createBooking(data: IBooking): Promise<IBooking> {
    const client: PoolClient = await this.pool.connect();
    try {
      const query = `
        INSERT INTO booking (user_id, flight_id, status, seats, total_price) values ($1, $2, $3, $4, $5)
        RETURNING *`;
      const values = [data.user_id, data.flight_id, data.status, data.seats, data.total_price];
      const result = await client.query(query, values);
      const booking: IBooking = result.rows[0];
      return booking;
    } catch (error) {
      console.log('Error in BookingRepository: createBooking:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getAllBookings(): Promise<IBooking[]> {
    const client: PoolClient = await this.pool.connect();
    try {
      const query = `SELECT * FROM booking`;
      const result = await client.query(query);
      const bookings: IBooking[] = result.rows;
      return bookings;
    } catch (error) {
      console.log('Error in BookingRepository: getAllBookings:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getBookingById(id: string): Promise<IBooking> {
    const client: PoolClient = await this.pool.connect();
    try {
      const query = `SELECT * FROM booking WHERE id = $1`;
      const result = await client.query(query, [id]);
      const booking: IBooking = result.rows[0];
      return booking;
    } catch (error) {
      console.log('Error in BookingRepository: getBookingById:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async updateBookingStatus(id: string, status: IStatus): Promise<IBooking> {
    const client: PoolClient = await this.pool.connect();
    try {
      const query = `UPDATE booking SET status = $1 WHERE id = $2 RETURNING *`;
      const result = await client.query(query, [status, id]);
      const booking: IBooking = result.rows[0];
      return booking;
    } catch (error) {
      console.log('Error in BookingRepository: updateBookingStatus:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getBookingsByUserId(userId: string): Promise<IBooking[]> {
    const client: PoolClient = await this.pool.connect();
    try {
      const query = `SELECT * FROM booking WHERE user_id = $1`;
      const result = await client.query(query, [userId]);
      const bookings: IBooking[] = result.rows;
      return bookings;
    } catch (error) {
      console.log('Error in BookingRepository: getBookingsByUserId:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getBookingsForFlightByDate(flightId: string, date: Date): Promise<IBooking[]> {
    const client: PoolClient = await this.pool.connect();
    try {
      const query = `SELECT * FROM booking WHERE flight_id = $1 AND created_at::date = $2`;
      const result = await client.query(query, [flightId, date]);
      const bookings: IBooking[] = result.rows;
      return bookings;
    } catch (error) {
      console.log('Error in BookingRepository: getBookingsForFlightByDate:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}
