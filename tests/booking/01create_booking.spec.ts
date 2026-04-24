import { test, expect } from "@playwright/test";
import { createBooking } from "../../utils/api-helpers.js";

import { buildBookingPayload } from "../../utils/payload-builders.js";
import type { CreateBookingResponse } from "../../utils/types.js";

test.describe("CreateBooking — POST /booking", () => {
  test("should create a booking and return it with an ID", async ({ request }) => {
    // Arrange — build a random booking payload
    const payload = buildBookingPayload();
    //Send request to server
    const response = await createBooking(request, payload);
    //Assertion
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody: CreateBookingResponse = await response.json();

    // The response must include a new numeric booking ID
    expect(responseBody).toHaveProperty("bookingid");
    expect(typeof responseBody.bookingid).toBe("number");

    // The returned booking should match what we sent
    expect(responseBody.booking.firstname).toBe(payload.firstname);
    expect(responseBody.booking.lastname).toBe(payload.lastname);
    expect(responseBody.booking.totalprice).toBe(payload.totalprice);
    expect(responseBody.booking.depositpaid).toBe(payload.depositpaid);
    expect(responseBody.booking.bookingdates.checkin).toBe(payload.bookingdates.checkin);
    expect(responseBody.booking.bookingdates.checkout).toBe(payload.bookingdates.checkout);
    expect(responseBody.booking.additionalneeds).toBe(payload.additionalneeds);
  });

  test("should create a booking without additionalneeds field", async ({request}) => {
    // Arrange — omit the optional field
    const payload = buildBookingPayload();
    delete payload.additionalneeds;

    //Send request to server
    const response = await createBooking(request, payload);

    //Assertion
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody: CreateBookingResponse = await response.json();
    expect(responseBody).toHaveProperty("bookingid");
    expect(responseBody.booking.firstname).toBe(payload.firstname);
    expect(responseBody.booking.lastname).toBe(payload.lastname);
    expect(responseBody.booking.totalprice).toBe(payload.totalprice);
    expect(responseBody.booking.depositpaid).toBe(payload.depositpaid);
    expect(responseBody.booking.bookingdates.checkin).toBe(payload.bookingdates.checkin);
    expect(responseBody.booking.bookingdates.checkout).toBe(payload.bookingdates.checkout);
  });
});
