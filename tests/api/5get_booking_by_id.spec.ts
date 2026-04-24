import { test, expect } from '@playwright/test';
import {faker} from '@faker-js/faker';
import {DateTime} from 'luxon'; //npm i --save-dev @types/luxon
import {stringFormat} from '../../utils/common.js'
import createBookingPayload from '../../testdata/create_booking_dynamic_payload.json' with { type: "json" };

const BASE_URL = "https://restful-booker.herokuapp.com";

test('Create Booking using dynamic JSON body', async ({request}) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const totalPrice = faker.number.int(1000);
    const checkInDate = DateTime.now().toFormat("yyyy-MM-dd");
    const checkOutDate = DateTime.now().plus({day:6}).toFormat("yyyy-MM-dd");
    const additionalNeeds = faker.string.alpha(10);
    
    var dynamicRequestBody = stringFormat(JSON.stringify(createBookingPayload), firstName, lastName, totalPrice, checkInDate, checkOutDate, additionalNeeds);
    const dynamicPayload = JSON.parse(dynamicRequestBody);
    const response = await request.post(`${BASE_URL}/booking`, {
        data: dynamicPayload
    })

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);


    const responseBody = await response.json();
    console.log(responseBody);

    const bId = responseBody.bookingid;

    expect(responseBody.booking).toHaveProperty("firstname", dynamicPayload.firstname);
    expect(responseBody.booking).toHaveProperty("lastname", dynamicPayload.lastname);

    expect(responseBody.booking.bookingdates).toHaveProperty("checkin",dynamicPayload.bookingdates.checkin);
    expect(responseBody.booking.bookingdates).toHaveProperty("checkout",dynamicPayload.bookingdates.checkout);

    expect(responseBody.booking).toHaveProperty("additionalneeds", dynamicPayload.additionalneeds);

    console.log(" ******************************* ");
    // GET API call
    const getBookingDetails = await request.get(`${BASE_URL}/booking/${bId}`,{});

    expect(getBookingDetails.ok()).toBeTruthy();
    expect(getBookingDetails.status()).toBe(200);

    const bookingDetails = await getBookingDetails.json();
    console.log(bookingDetails);

    expect(bookingDetails).toHaveProperty("firstname", dynamicPayload.firstname);
    expect(bookingDetails).toHaveProperty("lastname", dynamicPayload.lastname);
    console.log(dynamicPayload.totalprice);
    expect(bookingDetails).toHaveProperty("totalprice", parseInt(dynamicPayload.totalprice));

    expect(bookingDetails.bookingdates).toHaveProperty("checkin",dynamicPayload.bookingdates.checkin);
    expect(bookingDetails.bookingdates).toHaveProperty("checkout",dynamicPayload.bookingdates.checkout);
    expect(bookingDetails).toHaveProperty("additionalneeds", dynamicPayload.additionalneeds);

})