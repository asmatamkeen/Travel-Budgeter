# Travel Budgeter

**Plan trips by what you can afford, not just where you want to go.**

## The problem

Budget travelers usually plan backwards: pick a destination first, then discover it's
unaffordable, then bounce between flight sites, hotel sites, and currency converters
trying to make the numbers work manually.

Travel Budgeter flips the order. You enter your total budget and home currency up
front, and the app shows what's actually achievable within that budget — real
flights, real hotels, converted to your currency, with a clear breakdown of where
the money goes.

## MVP features

- Budget input + home currency selection
- Destination + travel dates input
- Real-time currency conversion
- Live flight search filtered toward your budget
- Live hotel search using whatever budget is left after flights
- A simple budget breakdown (flight / hotel / leftover)
- User accounts — sign up, log in, save and revisit past trip searches (stored
  in-app, no email service involved)

## Explicitly out of scope (for now)

- **Real payment processing or ticket booking.** The app redirects users to the
  airline/hotel's own site to complete booking (like Skyscanner or Kayak do).
  Real booking requires PCI-DSS compliance and formal partnerships with
  airlines/hotels — not realistic for a solo student project, and it carries real
  legal and financial liability.
- **Trains/buses.** There isn't a reliable free API for most regions, especially
  India.
- **Places-to-visit / itinerary suggestions.**
- **Group trip budget splitting.**

## Tech stack

- **Frontend:** React
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (free tier)
- **Auth:** JWT + bcrypt (passwords are always hashed, never stored in plain text)
- **APIs:**
  - Currency — [open.er-api.com](https://open.er-api.com) (free, no key needed)
  - Flights — Sky Scrapper via RapidAPI (free tier)
  - Hotels — RapidAPI hotel listing / Booking.com affiliate
  - Mock data fallback for all of the above, so the app keeps working if free-tier
    API limits run out

## Status

Early build — currently working through the backend skeleton and auth system.
