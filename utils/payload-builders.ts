/**
 * Payload builders — generate randomised but valid request bodies using @faker-js/faker.
 *
 * Keeping payload construction separate from the tests makes them
 * shorter and lets us reuse the same builders across positive, negative, and E2E scenarios.
 */

import { faker } from "@faker-js/faker";
import type { AuthPayload, BookingPayload } from "./types.js"
import { DateTime } from 'luxon'

/**
 * Build a random BookingPayload.
 *
 * Dates are always in the future so the API never rejects them.
 */
export function buildBookingPayload(
  overrides: Partial<BookingPayload> = {}
): BookingPayload {
  //const checkinDate = faker.date.soon({ days: 30 });
  //const checkoutDate = faker.date.soon({ days: 15, refDate: checkinDate });

  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 100, max: 1000 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: {
      //checkin: checkinDate.toISOString().split("T")[0],
      //checkout: checkoutDate.toISOString().split("T")[0],
      checkin:DateTime.now().toFormat('yyyy-MM-dd'),
      checkout:DateTime.now().plus({day:5}).toFormat('yyyy-MM-dd')
    },
    additionalneeds: faker.helpers.arrayElement([
      "Breakfast",
      "Lunch",
      "Dinner",
      "Parking",
      "WiFi",
      "Late checkout",
    ]),
    ...overrides, // allow callers to pin specific fields
  };
}

/**
 * Build valid admin credentials for the Restful Booker.
 *
 * The demo server ships with a hardcoded admin account:
 *   username: admin  /  password: password123
 */
export function buildAuthPayload(): AuthPayload {
  return {
    username: "admin",
    password: "password123",
  };
}