/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // create status enum
  pgm.sql(`
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');
  `);
  // create table booking
  pgm.sql(`
    CREATE TABLE booking (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id uuid NOT NULL,
      flight_id uuid NOT NULL,
      status booking_status NOT NULL DEFAULT 'pending',
      seats integer NOT NULL,
      total_price numeric(10, 2) NOT NULL,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    )`);
  // create index on user_id
  pgm.sql(`
      CREATE INDEX idx_booking_user_id ON booking (user_id);
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // drop table booking
  pgm.sql(`
    DROP TABLE IF EXISTS booking;
  `);
  // drop index on user_id
  pgm.sql(`
    DROP INDEX IF EXISTS idx_booking_user_id;
  `);
  // drop status enum
  pgm.sql(`
    DROP TYPE IF EXISTS booking_status;
  `);
};
