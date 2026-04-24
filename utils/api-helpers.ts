/**
 * API helper module — thin wrappers around the Restful Booker endpoints.
 *
 * Each function accepts an APIRequestContext (provided by Playwright) and
 * returns the raw APIResponse so that individual tests can assert on status
 * codes, headers, and bodies independently.
 */

import type { APIRequestContext } from "@playwright/test";
import type {
  AuthPayload,
  BookingPayload,
} from "./types.js";

// ─── Auth ──────────────────────────────────────────────────────────────────────

/**
 * POST /auth — Create an authentication token.
 */
export async function createToken(
  request: APIRequestContext,
  payload: AuthPayload
) {
  return request.post("/auth", { data: payload });
}

// ─── Booking CRUD ──────────────────────────────────────────────────────────────

/**
 * GET /booking — Retrieve all booking IDs (optionally filtered by query params).
 */
export async function getBookingIds(
  request: APIRequestContext,
  params?: Record<string, string>
) {
  return request.get("/booking", { params });
}

/**
 * GET /booking/:id — Retrieve a single booking by its ID.
 */
export async function getBooking(
  request: APIRequestContext,
  id: number
) {
  return request.get(`/booking/${id}`);
}

/**
 * POST /booking — Create a new booking.
 */
export async function createBooking(
  request: APIRequestContext,
  payload: BookingPayload
) {
  return request.post("/booking", {
    data: payload,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * PUT /booking/:id — Full update of an existing booking (requires auth).
 */
export async function updateBooking(
  request: APIRequestContext,
  id: number,
  payload: BookingPayload,
  token: string
) {
  return request.put(`/booking/${id}`, {
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token}`,
    },
  });
}

/**
 * PATCH /booking/:id — Partial update of an existing booking (requires auth).
 */
export async function partialUpdateBooking(
  request: APIRequestContext,
  id: number,
  payload: Partial<BookingPayload>,
  token: string
) {
  return request.patch(`/booking/${id}`, {
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token}`,
    },
  });
}

/**
 * DELETE /booking/:id — Delete a booking (requires auth).
 */
export async function deleteBooking(
  request: APIRequestContext,
  id: number,
  token: string
) {
  return request.delete(`/booking/${id}`, {
    headers: {
      Cookie: `token=${token}`,
    },
  });
}

// ─── Ping ──────────────────────────────────────────────────────────────────────

/**
 * GET /ping — Health-check endpoint.
 */
export async function healthCheck(request: APIRequestContext) {
  return request.get("/ping");
}