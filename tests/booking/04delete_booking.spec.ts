import { test, expect } from "@playwright/test";
import { createToken, createBooking, getBooking, deleteBooking } from "../../utils/api-helpers.js";

import { buildAuthPayload, buildBookingPayload} from "../../utils/payload-builders.js";
import type { CreateBookingResponse } from "../../utils/types.js";

// ─── DELETE /booking/:id ───────────────────────────────────────────────────────
let token: string;

test.beforeAll(async ({ request }) => {
  // Obtain an auth token that all mutating tests in this file will reuse
  const response = await createToken(request, buildAuthPayload());
  const body = await response.json();
  token = body.token;
});

test.describe("DeleteBooking — DELETE /booking/:id", () => {
  test("should delete an existing booking and return 201", async ({ request }) => {
    // create a booking to delete
    const payload = buildBookingPayload();
    const createResponse = await createBooking(request, payload);
    const { bookingid }: CreateBookingResponse = await createResponse.json();

    // delete booking request
    const deleteResponse = await deleteBooking(request, bookingid, token);

    // Assert — the API returns 201 on successful deletion
    expect(deleteResponse.status()).toBe(201);
    expect(deleteResponse.statusText()).toBe("Created");

    // Confirm the booking no longer exists
    const getResponse = await getBooking(request, bookingid);
    expect(getResponse.status()).toBe(404);
    expect(getResponse.statusText()).toBe("Not Found");
  });
});