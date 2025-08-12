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
      let query = `SELECT * FROM booking WHERE flight_id = $1 AND seat_number = $2`;
      const v = [data.flight_id, data.seat_number];
      let result = await client.query(query, v);
      if (result.rows.length > 0) {
        throw new ApiError(400, 'Seat already booked');
      }
      query = `INSERT INTO booking 
                    (user_id, flight_id, email, seat_type, total_price, seat_number, created_at) 
                    values ($1, $2, $3, $4, $5, $6, $7) 
                    RETURNING *`;
      const values = [
        data.user_id,
        data.flight_id,
        data.email,
        data.seat_type,
        data.total_price,
        data.seat_number,
        data.date,
      ];
      result = await client.query(query, values);
      const booking: IBooking = result.rows[0];
      return booking;
    } finally {
      client.release();
    }
  }

  async getAllBookings(limit: number, offset: number): Promise<IBooking[]> {
    const client: PoolClient = await this.pool.connect();
    try {
      const query = `SELECT * FROM booking order by created_at DESC LIMIT $1 OFFSET $2`;
      const result = await client.query(query, [limit, offset]);
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

  async getBookingsByUserId(userId: string): Promise<IBooking[]> {
    const client: PoolClient = await this.pool.connect();
    try {
      const query = `SELECT * FROM booking WHERE user_id = $1 ORDER BY created_at DESC`;
      const result = await client.query(query, [userId]);
      const bookings: IBooking[] = result.rows;
      return bookings;
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

  async getBookingsForFlightForUsers(flightId: string): Promise<{ id: string; seat_number: string }[]> {
    const client: PoolClient = await this.pool.connect();
    try {
      const query = `SELECT * FROM booking WHERE flight_id = $1`;
      const result = await client.query(query, [flightId]);
      const bookings: IBooking[] = result.rows;
      const bookingRespose: { id: string; seat_number: string }[] = bookings.map((booking) => ({
        id: booking.id,
        seat_number: booking.seat_number,
      }));
      return bookingRespose;
    } finally {
      client.release();
    }
  }

  async getBookingByFlightIdAndSeatNumber(flightId: string, seatNumber: string): Promise<IBooking | null> {
    const client: PoolClient = await this.pool.connect();
    try {
      const query = `SELECT * FROM booking WHERE flight_id = $1 AND seat_number = $2`;
      const result = await client.query(query, [flightId, seatNumber]);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getBookingsByFlightIdAndUserId(flightId: string, userId: string): Promise<IBooking[]> {
    const client: PoolClient = await this.pool.connect();
    try {
      const query = `SELECT * FROM booking WHERE flight_id = $1 AND user_id = $2`;
      const result = await client.query(query, [flightId, userId]);
      return result.rows;
    } finally {
      client.release();
    }
  }
}
