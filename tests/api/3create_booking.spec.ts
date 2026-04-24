import { test, expect } from '@playwright/test';
import {faker} from '@faker-js/faker';
import {DateTime} from 'luxon'; //npm i --save-dev @types/luxon

const BASE_URL = "https://restful-booker.herokuapp.com";

test('Create Booking using dynamic request body', async ({request}) => {

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const totalPrice = faker.number.int(1000);

    const checkInDate = DateTime.now().toFormat("yyyy-MM-dd");
    const checkOutDate = DateTime.now().plus({day:5}).toFormat("yyyy-MM-dd");
    
    const response = await request.post(`${BASE_URL}/booking`, {
        data: {
            "firstname": firstName,
            "lastname": lastName,
            "totalprice": totalPrice,
            "depositpaid": true,
            "bookingdates": {
                "checkin": checkInDate,
                "checkout": checkOutDate
            },
            "additionalneeds": "super bowls"
        }
    })

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);


    const responseBody = await response.json();
    console.log(responseBody);

    expect(responseBody.booking).toHaveProperty("firstname", firstName);
    expect(responseBody.booking).toHaveProperty("lastname",lastName);

    expect(responseBody.booking.bookingdates).toHaveProperty("checkin",checkInDate);
    expect(responseBody.booking.bookingdates).toHaveProperty("checkout",checkOutDate);


})