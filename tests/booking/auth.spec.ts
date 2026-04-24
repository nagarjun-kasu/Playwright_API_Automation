/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  Auth Tests  —  POST /auth
 * ──────────────────────────────────────────────────────────────────────────────
 *
 *  The /auth endpoint generates a token required for PUT, PATCH, and DELETE
 *  operations.  Positive tests verify that valid credentials produce a
 *  non-empty token string.
 */

import { test, expect } from "@playwright/test";
import { createToken } from "../../utils/api-helpers.js";
import { buildAuthPayload } from "../../utils/payload-builders.js";

test.describe("Auth — POST /auth", () => {
  test("should create a token with valid admin credentials", async ({
    request,
  }) => {
    // Arrange — use the known admin credentials
    const authPayload = buildAuthPayload();

    // Act — request a token
    const response = await createToken(request, authPayload);

    // Assert — status 200 and a non-empty token string is returned
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("token");
    expect(typeof body.token).toBe("string");
    expect(body.token.length).toBeGreaterThan(0);
  });

  test("should return a reason when credentials are invalid", async ({
    request,
  }) => {
    // Arrange — deliberately wrong credentials
    const badPayload = { username: "wrong", password: "wrong" };

    // Act
    const response = await createToken(request, badPayload);

    // Assert — the API still returns 200 but with a "reason" field
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("reason", "Bad credentials");
  });
});