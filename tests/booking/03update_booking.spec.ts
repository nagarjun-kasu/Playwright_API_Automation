import { test, expect } from "@playwright/test";
import {createToken, createBooking, updateBooking, partialUpdateBooking} from "../../utils/api-helpers.js";

import { buildAuthPayload, buildBookingPayload} from "../../utils/payload-builders.js";
import type { CreateBookingResponse } from "../../utils/types.js";
import { faker } from "@faker-js/faker";

// ***** Shared auth token obtained once for the whole file ***********

let token: string;

test.beforeAll(async ({ request }) => {
  // Obtain an auth token that all mutating tests in this file will reuse
  const response = await createToken(request, buildAuthPayload());
  const body = await response.json();
  token = body.token;
});

// ******** PUT /booking/:id *****************************

test.describe("UpdateBooking — PUT /booking/:id", () => {
  test("should fully update an existing booking", async ({ request }) => {
    // create the original booking
    const original = buildBookingPayload();
    const createResponse = await createBooking(request, original);
    const { bookingid }: CreateBookingResponse = await createResponse.json();

    // Build an entirely new payload for the update
    const updated = buildBookingPayload({
      firstname: "Updated",
      lastname: "Guest",
      totalprice: 9999,
      depositpaid: true,
      additionalneeds: "Late checkout",
    });

    // full update via PUT
    const response = await updateBooking(request, bookingid, updated, token);

    // Assert
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const reponseBody = await response.json();
    expect(reponseBody.firstname).toBe("Updated");
    expect(reponseBody.lastname).toBe("Guest");
    expect(reponseBody.totalprice).toBe(9999);
    expect(reponseBody.depositpaid).toBe(true);
    expect(reponseBody.additionalneeds).toBe("Late checkout");
  });
});

// *********** PATCH /booking/:id ************************************

test.describe("PartialUpdateBooking — PATCH /booking/:id", () => {
  test("should partially update only the firstname", async ({ request }) => {
    // Arrange
    const original = buildBookingPayload();
    const createResponse = await createBooking(request, original);
    const { bookingid }: CreateBookingResponse = await createResponse.json();

    // update only the firstname via PATCH
    const firstName = faker.person.firstName();
    const response = await partialUpdateBooking(request, bookingid, { firstname: firstName }, token);

    // Assert — firstname changed, lastname unchanged
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.firstname).toBe(firstName);
    expect(responseBody.lastname).toBe(original.lastname);
  });

  test("should partially update totalprice and depositpaid", async ({ request }) => {
    // create original booking
    const original = buildBookingPayload({ depositpaid: false });
    const createResponse = await createBooking(request, original);
    const { bookingid }: CreateBookingResponse = await createResponse.json();

    // partial update request
    const response = await partialUpdateBooking(request, bookingid, { totalprice: 1234, depositpaid: true }, token);

    // Assert
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.totalprice).toBe(1234);
    expect(responseBody.depositpaid).toBe(true);

  });
});