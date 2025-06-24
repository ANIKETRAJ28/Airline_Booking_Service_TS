import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 8080;
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = process.env.DB_PORT;
export const DB_NAME = process.env.DB_NAME;
export const DB_URL = process.env.DB_URL;
export const NODE_ENV = process.env.NODE_ENV;
export const AIRLINE_SEARCH_API_KEY = process.env.AIRLINE_SEARCH_API_KEY;
export const AIRLINE_REMINDER_QUEUE_URL = process.env.AIRLINE_REMINDER_QUEUE_URL as string;
export const AIRLINE_BOOKING_QUEUE_URL = process.env.AIRLINE_BOOKING_QUEUE_URL as string;
export const AIRLINE_BOOKING_QUEUE_NAME = process.env.AIRLINE_BOOKING_QUEUE_NAME as string;
export const AIRLINE_REMINDER_QUEUE_NAME = process.env.AIRLINE_REMINDER_QUEUE_NAME as string;
