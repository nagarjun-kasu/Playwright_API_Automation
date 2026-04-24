import { test, expect } from '@playwright/test';
import createBookingPayload from '../../testdata/create_booking_payload.json' with { type: "json" };

const BASE_URL = "https://restful-booker.herokuapp.com";

test('Create Booking using static JSON body', async ({ request }) => {

    const response = await request.post(`${BASE_URL}/booking`, {
        data: createBookingPayload
    })

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);


    const responseBody = await response.json();
    console.log(responseBody);

    expect(responseBody.booking).toHaveProperty("firstname", createBookingPayload.firstname);
    expect(responseBody.booking).toHaveProperty("lastname", createBookingPayload.lastname);

    expect(responseBody.booking.bookingdates).toHaveProperty("checkin", createBookingPayload.bookingdates.checkin);
    expect(responseBody.booking.bookingdates).toHaveProperty("checkout", createBookingPayload.bookingdates.checkout);


})