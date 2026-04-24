/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  Health-Check Tests  —  GET /ping
 * ──────────────────────────────────────────────────────────────────────────────
 *
 *  The /ping endpoint is a simple liveness probe.  If the API is up it
 *  returns HTTP 201.  These tests confirm the service is reachable before
 *  any booking-related tests run.
 */

import { test, expect } from "@playwright/test";
import { healthCheck } from "../../utils/api-helpers.js";

test.describe("Health Check — GET /ping", () => {
  test("should return 201 when the API is alive", async ({ request }) => {
    // Act — hit the health-check endpoint
    const response = await healthCheck(request);

    // Assert — the service returns 201 Created as a "healthy" signal
    expect(response.status()).toBe(201);
  });
});