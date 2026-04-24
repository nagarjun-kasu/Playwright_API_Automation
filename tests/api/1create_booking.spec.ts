import { test, expect } from '@playwright/test';

const BASE_URL = "https://restful-booker.herokuapp.com";
test('Create Booking using static request body', async ({request}) => {
    
    const response = await request.post(`${BASE_URL}/booking`, {
        data: {
            "firstname": "Shakthi",
            "lastname": "Reddy",
            "totalprice": 1000,
            "depositpaid": true,
            "bookingdates": {
                "checkin": "2026-05-01",
                "checkout": "2026-05-06"
            },
            "additionalneeds": "super bowls"
        }
    })

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);


    const responseBody = await response.json();
    console.log(responseBody);

    expect(responseBody.booking).toHaveProperty("firstname", "Shakthi");
    expect(responseBody.booking).toHaveProperty("lastname","Reddy");

    expect(responseBody.booking.bookingdates).toHaveProperty("checkin","2024-07-04");
    expect(responseBody.booking.bookingdates).toHaveProperty("checkout","2024-12-31");


})