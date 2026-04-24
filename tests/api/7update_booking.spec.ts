import { test, expect } from '@playwright/test';
import {faker} from '@faker-js/faker';
import {DateTime} from 'luxon'; //npm i --save-dev @types/luxon
import {stringFormat} from '../../utils/common.js'
import createBookingPayload from '../../testdata/create_booking_dynamic_payload.json' with { type: "json" };
import tokenRequest from "../../testdata/token_request_payload.json" with { type: "json" };
import putRequest from "../../testdata/update_booking_payload.json" with { type: "json" };

const BASE_URL = "https://restful-booker.herokuapp.com";

test('Update Booking details', async ({request}) => {

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const totalPrice = faker.number.int(1000);
    const checkInDate = DateTime.now().toFormat("yyyy-MM-dd");
    const checkOutDate = DateTime.now().plus({day:6}).toFormat("yyyy-MM-dd");
    const additionalNeeds = faker.string.alpha(10);
    
    console.log(" *** Create Booking ***");
    var dynamicRequestBody = stringFormat(JSON.stringify(createBookingPayload), firstName, lastName, totalPrice, checkInDate, checkOutDate, additionalNeeds);
    const dynamicPayload = JSON.parse(dynamicRequestBody);
    const response = await request.post(`${BASE_URL}/booking`, {
        data: dynamicPayload
    })

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);


    const responseBody = await response.json();
    console.log(responseBody);

    const fname = responseBody.booking.firstname;
    const lname = responseBody.booking.lastname;
    const bId = responseBody.bookingid;

    expect(responseBody.booking).toHaveProperty("firstname", dynamicPayload.firstname);
    expect(responseBody.booking).toHaveProperty("lastname", dynamicPayload.lastname);

    expect(responseBody.booking.bookingdates).toHaveProperty("checkin",dynamicPayload.bookingdates.checkin);
    expect(responseBody.booking.bookingdates).toHaveProperty("checkout",dynamicPayload.bookingdates.checkout);

    expect(responseBody.booking).toHaveProperty("additionalneeds", dynamicPayload.additionalneeds);

    console.log(" *** GET Booking by ID *** ");
    // GET API call
    const getBookingDetails = await request.get(`${BASE_URL}/booking` , {
        params:{
            "firstname":fname,
            "lastname":lname
        }
    });
    const bookingDetails = await getBookingDetails.json();
    console.log(bookingDetails);

    expect(getBookingDetails.ok()).toBeTruthy();
    expect(getBookingDetails.status()).toBe(200);

    expect(bookingDetails[0]).toHaveProperty("bookingid", bId);
    
    console.log(" *** Generate Token ***");
    const tokenAPIResponse = await request.post(`${BASE_URL}/auth`, {
        data: tokenRequest,
      });
      expect(tokenAPIResponse.ok()).toBeTruthy();
      expect(tokenAPIResponse.status()).toBe(200);
    
      const tokenResponseBody = await tokenAPIResponse.json();
      console.log(tokenResponseBody);
      const tokenNo = tokenResponseBody.token;

      console.log(" *** Update Booking Details ***");

      const putAPIResponse = await request.put(`${BASE_URL}/booking/${bId}`, {
        headers: {
          "Content-Type": "application/json",
          "Cookie": `token=${tokenNo}`,
        },
        data: putRequest,
      });
    
      console.log(await putAPIResponse.json());
      expect(putAPIResponse.ok()).toBeTruthy();
      expect(putAPIResponse.status()).toBe(200);

      const updatedResponse = await putAPIResponse.json();
      expect(updatedResponse).toHaveProperty("firstname",putRequest.firstname);
      expect(updatedResponse).toHaveProperty("lastname",putRequest.lastname);
      
})