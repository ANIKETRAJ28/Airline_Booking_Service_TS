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
    CREATE TYPE seat_type AS ENUM ('economy', 'premium', 'business');
  `);

  pgm.sql(`
    ALTER TABLE booking
    DROP COLUMN seats,
    ADD COLUMN email VARCHAR(255) NOT NULL,
    ADD COLUMN seat_type seat_type NOT NULL;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE booking
    ADD COLUMN seats INTEGER NOT NULL,
    DROP COLUMN seat_type,
    DROP COLUMN email;
  `);
  pgm.sql(`
    DROP TYPE seat_type;
  `);
};
