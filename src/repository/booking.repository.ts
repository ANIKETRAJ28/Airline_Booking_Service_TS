import { Pool, PoolClient } from 'pg';
import { getPool } from '../util/dbPool.util';
import { IBooking, IBookingRequest } from '../interface/booking.interface';
import { IStatus } from '../types/booking.types';
import { ApiError } from '../util/api.util';

export class BookingRepository {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  async createBooking(data: IBookingRequest & { flight_id: string; user_id: string; date: Date }): Promise<IBooking> {
    const client: PoolClient = await this.pool.connect();
    try {
      const query = `INSERT INTO booking 
                    (user_id, flight_id, email, seat_type, total_price, created_at) 
                    values ($1, $2, $3, $4, $5, $6) 
                    RETURNING *`;
      const values = [data.user_id, data.flight_id, data.email, data.seat_type, data.total_price, data.date];
      const result = await client.query(query, values);
      const booking: IBooking = result.rows[0];
      return booking;
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
      if (booking === undefined) {
        throw new ApiError(404, 'Booking not found');
      }
      return booking;
    } finally {
      client.release();
    }
  }

  async updateBookingStatus(id: string, status: IStatus): Promise<IBooking> {
    const client: PoolClient = await this.pool.connect();
    try {
      let query = `SELECT * from booking WHERE id = $1`;
      let result = await client.query(query, [id]);
      if (result.rows.length === 0) {
        throw new ApiError(404, 'Booking not found');
      }
      query = `UPDATE booking SET status = $1 WHERE id = $2 RETURNING *`;
      result = await client.query(query, [status, id]);
      const booking: IBooking = result.rows[0];
      return booking;
    } finally {
      client.release();
    }
  }

  async getBookingsByUserId(userId: string): Promise<IBooking[][]> {
    const client: PoolClient = await this.pool.connect();
    try {
      const query = `SELECT * FROM booking WHERE user_id = $1`;
      const result = await client.query(query, [userId]);
      const bookings: IBooking[] = result.rows;
      const bookingResponse: IBooking[][] = [];
      const map = new Map<string, IBooking[]>();
      bookings.forEach((booking) => {
        if (!map.has(booking.created_at.toISOString())) {
          map.set(booking.created_at.toISOString(), []);
        }
        map.get(booking.created_at.toISOString())!.push(booking);
      });
      map.forEach((value) => {
        bookingResponse.push(value);
      });
      return bookingResponse;
    } finally {
      client.release();
    }
  }

  async getBookingsForFlight(flightId: string): Promise<IBooking[]> {
    const client: PoolClient = await this.pool.connect();
    try {
      const query = `SELECT * FROM booking WHERE flight_id = $1`;
      const result = await client.query(query, [flightId]);
      const bookings: IBooking[] = result.rows;
      return bookings;
    } finally {
      client.release();
    }
  }
}
