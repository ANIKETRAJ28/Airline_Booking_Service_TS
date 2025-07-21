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
  pgm.sql(`
    ALTER TABLE booking
    ADD COLUMN seat_number VARCHAR(3) NOT NULL;
  `);
  pgm.addConstraint('booking', 'unique_booking_id_seat_number', {
    unique: ['id', 'seat_number'],
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE booking
    DROP CONSTRAINT unique_booking_id_seat_number;
  `);
  pgm.sql(`
    ALTER TABLE booking
    DROP COLUMN seat_number;
  `);
};
