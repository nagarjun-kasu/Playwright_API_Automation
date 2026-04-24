import { test, expect } from "@playwright/test";
import {
  createBooking,
  getBookingIds,
  getBooking
} from "../../utils/api-helpers.js";

import { buildBookingPayload } from "../../utils/payload-builders.js";
import type { CreateBookingResponse } from "../../utils/types.js";
import { faker } from "@faker-js/faker";

// ─── GET /booking/:id ──────────────────────────────────────────────────────────

test.describe("GetBooking — GET /booking/:id", () => {
  test("should retrieve a booking by its ID", async ({ request }) => {
    // create a booking first
    const payload = buildBookingPayload();
    const createResponse = await createBooking(request, payload);
    const { bookingid }: CreateBookingResponse = await createResponse.json();

    // fetch the same booking by ID
    const response = await getBooking(request, bookingid);

    // Assertions
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.firstname).toBe(payload.firstname);
    expect(responseBody.lastname).toBe(payload.lastname);
    expect(responseBody.totalprice).toBe(payload.totalprice);
    expect(responseBody.depositpaid).toBe(payload.depositpaid);
    expect(responseBody.bookingdates.checkin).toBe(payload.bookingdates.checkin);
    expect(responseBody.bookingdates.checkout).toBe(payload.bookingdates.checkout);
    expect(responseBody.booking.additionalneeds).toBe(payload.additionalneeds);

    
  });

  test("should return 404 for a non-existent booking ID", async ({request}) => {
    // use a high ID that won't exist
    const response = await getBooking(request, 999999999);

    // Assert
    expect(response.status()).toBe(404);
    expect(response.statusText()).toBe("Not Found");
  });

// ─── GET /booking ──────────────────────────────────────────────────────────────

test.describe("GetBookingIds — GET /booking", () => {
  test("should filter bookings by firstname and lastname", async ({request}) => {
    // create a booking
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const payload = buildBookingPayload({
      firstname: firstName,
      lastname: lastName,
    });
    //Send request to server to create booking
    await createBooking(request, payload);

    // apply the firstname, lastname filter
    const response = await getBookingIds(request, {
      firstname: firstName,
      lastname: lastName,
    });

    // Assert
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThanOrEqual(1);
  });

  test("should filter bookings by checkin and checkout dates", async ({request}) => {
    //create a booking with known dates
    const payload = buildBookingPayload({
      bookingdates: { checkin: "2026-06-01", checkout: "2026-06-10" },
    });
    await createBooking(request, payload);

    // Act — use date filters
    const response = await getBookingIds(request, {
      checkin: "2026-06-01",
      checkout: "2026-06-10",
    });

    // Assert
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });
});

});