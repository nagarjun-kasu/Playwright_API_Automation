/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  End-to-End (E2E) Booking Tests
 * ──────────────────────────────────────────────────────────────────────────────
 *
 *  These tests simulate real-world user journeys that span multiple API
 *  endpoints in sequence.  Unlike the isolated positive tests, E2E tests
 *  verify that the endpoints work *together* correctly.
 *
 *  Scenarios covered:
 *
 *    1. Full booking lifecycle — create → read → update → partial-update → delete
 *    2. Search after creation — create a booking then find it via filters
 *    3. Token-gated operations — ensure auth is enforced for mutations
 *    4. Multiple bookings management — batch create, verify, then clean up
 */

import { test, expect } from "@playwright/test";
import {
  createToken,
  createBooking,
  getBooking,
  getBookingIds,
  updateBooking,
  partialUpdateBooking,
  deleteBooking,
  healthCheck,
} from "../../utils/api-helpers.js";
import {
  buildAuthPayload,
  buildBookingPayload,
} from "../../utils/payload-builders.js";
import type { CreateBookingResponse } from "../../utils/types.js";

// ─── Shared state ──────────────────────────────────────────────────────────────

let token: string;

test.beforeAll(async ({ request }) => {
  // Ensure the API is healthy before running E2E scenarios
  const pingRes = await healthCheck(request);
  expect(pingRes.status()).toBe(201);

  // Obtain an auth token for the entire suite
  const authRes = await createToken(request, buildAuthPayload());
  const authBody = await authRes.json();
  token = authBody.token;
});

// ─── E2E Scenario 1: Full Booking Lifecycle ────────────────────────────────────

test.describe("E2E — Full Booking Lifecycle", () => {
  let bookingId: number;

  test("Step 1: Create a new booking", async ({ request }) => {
    const payload = buildBookingPayload({
      firstname: "E2E",
      lastname: "Lifecycle",
      totalprice: 500,
      depositpaid: false,
      additionalneeds: "Breakfast",
    });

    const response = await createBooking(request, payload);
    expect(response.status()).toBe(200);

    const body: CreateBookingResponse = await response.json();
    bookingId = body.bookingid;

    // Verify the response echoes what we sent
    expect(body.booking.firstname).toBe("E2E");
    expect(body.booking.lastname).toBe("Lifecycle");
    expect(body.booking.totalprice).toBe(500);
    expect(body.booking.depositpaid).toBe(false);
    expect(body.booking.additionalneeds).toBe("Breakfast");
  });

  test("Step 2: Read the created booking", async ({ request }) => {
    // The booking from Step 1 should be retrievable
    const response = await getBooking(request, bookingId);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.firstname).toBe("E2E");
    expect(body.lastname).toBe("Lifecycle");
  });

  test("Step 3: Fully update the booking (PUT)", async ({ request }) => {
    const updatedPayload = buildBookingPayload({
      firstname: "Updated-E2E",
      lastname: "Lifecycle-v2",
      totalprice: 750,
      depositpaid: true,
      additionalneeds: "Lunch",
    });

    const response = await updateBooking(
      request,
      bookingId,
      updatedPayload,
      token
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.firstname).toBe("Updated-E2E");
    expect(body.lastname).toBe("Lifecycle-v2");
    expect(body.totalprice).toBe(750);
    expect(body.depositpaid).toBe(true);
    expect(body.additionalneeds).toBe("Lunch");
  });

  test("Step 4: Partially update the booking (PATCH)", async ({ request }) => {
    const response = await partialUpdateBooking(
      request,
      bookingId,
      { firstname: "Patched-E2E", totalprice: 800 },
      token
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    // Changed fields
    expect(body.firstname).toBe("Patched-E2E");
    expect(body.totalprice).toBe(800);
    // Unchanged fields from Step 3
    expect(body.lastname).toBe("Lifecycle-v2");
    expect(body.depositpaid).toBe(true);
  });

  test("Step 5: Delete the booking", async ({ request }) => {
    const deleteRes = await deleteBooking(request, bookingId, token);
    expect(deleteRes.status()).toBe(201);

    // Confirm deletion — GET should now return 404
    const getRes = await getBooking(request, bookingId);
    expect(getRes.status()).toBe(404);
  });
});

// ─── E2E Scenario 2: Search After Creation ─────────────────────────────────────

test.describe("E2E — Search After Creation", () => {
  let bookingId: number;

  test("Step 1: Create a booking with unique identifiers", async ({
    request,
  }) => {
    const payload = buildBookingPayload({
      firstname: "SearchE2E",
      lastname: "UniqueGuest",
    });

    const response = await createBooking(request, payload);
    expect(response.status()).toBe(200);

    const body: CreateBookingResponse = await response.json();
    bookingId = body.bookingid;
  });

  test("Step 2: Find the booking by name filters", async ({ request }) => {
    const response = await getBookingIds(request, {
      firstname: "SearchE2E",
      lastname: "UniqueGuest",
    });
    expect(response.status()).toBe(200);

    const ids = await response.json();

    // The booking we just created must appear in the filtered list
    const found = ids.some(
      (entry: { bookingid: number }) => entry.bookingid === bookingId
    );
    expect(found).toBeTruthy();
  });

  test("Step 3: Clean up — delete the booking", async ({ request }) => {
    const deleteRes = await deleteBooking(request, bookingId, token);
    expect(deleteRes.status()).toBe(201);
  });
});

// ─── E2E Scenario 3: Token-Gated Operations ────────────────────────────────────

test.describe("E2E — Token-Gated Operations", () => {
  let bookingId: number;

  test.beforeAll(async ({ request }) => {
    // Seed a booking for the auth-enforcement tests
    const payload = buildBookingPayload();
    const res = await createBooking(request, payload);
    const body: CreateBookingResponse = await res.json();
    bookingId = body.bookingid;
  });

  test("PUT without token should be rejected (403)", async ({ request }) => {
    const payload = buildBookingPayload();

    // Deliberately pass an empty/invalid token
    const response = await updateBooking(request, bookingId, payload, "");
    expect(response.status()).toBe(403);
  });

  test("PATCH without token should be rejected (403)", async ({ request }) => {
    const response = await partialUpdateBooking(
      request,
      bookingId,
      { firstname: "Hacker" },
      ""
    );
    expect(response.status()).toBe(403);
  });

  test("DELETE without token should be rejected (403)", async ({ request }) => {
    const response = await deleteBooking(request, bookingId, "");
    expect(response.status()).toBe(403);
  });

  test.afterAll(async ({ request }) => {
    // Clean up the seeded booking
    await deleteBooking(request, bookingId, token);
  });
});

// ─── E2E Scenario 4: Multiple Bookings Management ──────────────────────────────

test.describe("E2E — Batch Booking Management", () => {
  const bookingIds: number[] = [];
  const bookingCount = 3;

  test("Step 1: Create multiple bookings in sequence", async ({ request }) => {
    for (let i = 0; i < bookingCount; i++) {
      const payload = buildBookingPayload({
        firstname: `BatchGuest${i}`,
        lastname: "BatchTest",
      });
      const response = await createBooking(request, payload);
      expect(response.status()).toBe(200);

      const body: CreateBookingResponse = await response.json();
      bookingIds.push(body.bookingid);
    }

    // All three IDs should be unique
    const uniqueIds = new Set(bookingIds);
    expect(uniqueIds.size).toBe(bookingCount);
  });

  test("Step 2: Verify each booking can be retrieved individually", async ({
    request,
  }) => {
    for (let i = 0; i < bookingIds.length; i++) {
      const response = await getBooking(request, bookingIds[i]);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.firstname).toBe(`BatchGuest${i}`);
      expect(body.lastname).toBe("BatchTest");
    }
  });

  test("Step 3: Update all bookings", async ({ request }) => {
    for (const id of bookingIds) {
      const response = await partialUpdateBooking(
        request,
        id,
        { additionalneeds: "Updated-Batch" },
        token
      );
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.additionalneeds).toBe("Updated-Batch");
    }
  });

  test("Step 4: Delete all bookings and confirm removal", async ({
    request,
  }) => {
    for (const id of bookingIds) {
      const deleteRes = await deleteBooking(request, id, token);
      expect(deleteRes.status()).toBe(201);

      // Confirm each booking is truly gone
      const getRes = await getBooking(request, id);
      expect(getRes.status()).toBe(404);
    }
  });
});