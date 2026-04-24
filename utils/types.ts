/**
 * Type definitions for the Restful Booker API.
 *
 * These interfaces mirror the JSON schemas documented at:
 *   https://restful-booker.herokuapp.com/apidoc/index.html
 */

/** Dates sub-object used inside a Booking payload */
export interface BookingDates {
  checkin: string; // format: YYYY-MM-DD
  checkout: string; // format: YYYY-MM-DD
}

/** Payload sent when creating or updating a booking */
export interface BookingPayload {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

/** Response returned by POST /booking */
export interface CreateBookingResponse {
  bookingid: number;
  booking: BookingPayload;
}

/** Payload sent to POST /auth to obtain a token */
export interface AuthPayload {
  username: string;
  password: string;
}

/** Response returned by POST /auth */
export interface AuthResponse {
  token: string;
}

/** A single item in the array returned by GET /booking */
export interface BookingIdEntry {
  bookingid: number;
}