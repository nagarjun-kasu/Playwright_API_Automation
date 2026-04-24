# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: booking\healthcheck.spec.ts >> Health Check — GET /ping >> should return 201 when the API is alive
- Location: tests\booking\healthcheck.spec.ts:15:3

# Error details

```
TypeError: apiRequestContext.get: Invalid URL
```

# Test source

```ts
  19  |  */
  20  | export async function createToken(
  21  |   request: APIRequestContext,
  22  |   payload: AuthPayload
  23  | ) {
  24  |   return request.post("/auth", { data: payload });
  25  | }
  26  | 
  27  | // ─── Booking CRUD ──────────────────────────────────────────────────────────────
  28  | 
  29  | /**
  30  |  * GET /booking — Retrieve all booking IDs (optionally filtered by query params).
  31  |  */
  32  | export async function getBookingIds(
  33  |   request: APIRequestContext,
  34  |   params?: Record<string, string>
  35  | ) {
  36  |   return request.get("/booking", { params });
  37  | }
  38  | 
  39  | /**
  40  |  * GET /booking/:id — Retrieve a single booking by its ID.
  41  |  */
  42  | export async function getBooking(
  43  |   request: APIRequestContext,
  44  |   id: number
  45  | ) {
  46  |   return request.get(`/booking/${id}`);
  47  | }
  48  | 
  49  | /**
  50  |  * POST /booking — Create a new booking.
  51  |  */
  52  | export async function createBooking(
  53  |   request: APIRequestContext,
  54  |   payload: BookingPayload
  55  | ) {
  56  |   return request.post("/booking", {
  57  |     data: payload,
  58  |     headers: { "Content-Type": "application/json" },
  59  |   });
  60  | }
  61  | 
  62  | /**
  63  |  * PUT /booking/:id — Full update of an existing booking (requires auth).
  64  |  */
  65  | export async function updateBooking(
  66  |   request: APIRequestContext,
  67  |   id: number,
  68  |   payload: BookingPayload,
  69  |   token: string
  70  | ) {
  71  |   return request.put(`/booking/${id}`, {
  72  |     data: payload,
  73  |     headers: {
  74  |       "Content-Type": "application/json",
  75  |       Cookie: `token=${token}`,
  76  |     },
  77  |   });
  78  | }
  79  | 
  80  | /**
  81  |  * PATCH /booking/:id — Partial update of an existing booking (requires auth).
  82  |  */
  83  | export async function partialUpdateBooking(
  84  |   request: APIRequestContext,
  85  |   id: number,
  86  |   payload: Partial<BookingPayload>,
  87  |   token: string
  88  | ) {
  89  |   return request.patch(`/booking/${id}`, {
  90  |     data: payload,
  91  |     headers: {
  92  |       "Content-Type": "application/json",
  93  |       Cookie: `token=${token}`,
  94  |     },
  95  |   });
  96  | }
  97  | 
  98  | /**
  99  |  * DELETE /booking/:id — Delete a booking (requires auth).
  100 |  */
  101 | export async function deleteBooking(
  102 |   request: APIRequestContext,
  103 |   id: number,
  104 |   token: string
  105 | ) {
  106 |   return request.delete(`/booking/${id}`, {
  107 |     headers: {
  108 |       Cookie: `token=${token}`,
  109 |     },
  110 |   });
  111 | }
  112 | 
  113 | // ─── Ping ──────────────────────────────────────────────────────────────────────
  114 | 
  115 | /**
  116 |  * GET /ping — Health-check endpoint.
  117 |  */
  118 | export async function healthCheck(request: APIRequestContext) {
> 119 |   return request.get("/ping");
      |                  ^ TypeError: apiRequestContext.get: Invalid URL
  120 | }
```