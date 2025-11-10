# MVC Folder Structure

The `MVC/` directory houses the Node.js + Express implementation of the Online Airline Ticketing System. The tree below reflects the current layout after wiring in authentication, admin tools, and booking CRUD flows.

```
MVC/                                # Your root folder (that's just my root folder)
├── config/
│   └── database.js                 # MongoDB connection helper
├── controllers/
│   ├── adminController.js          # Admin/dashboard helpers
│   ├── available_flightsController.js
│   └── loginController.js          # Login, register, profile flows
├── models/
│   ├── Available_Flight.js         # Flight catalog schema
│   ├── Booking.js                  # Reservation schema
│   └── Profile.js                  # User account schema
├── public/
│   ├── js/
│   │   ├── main.js                 # Global UI glue (profile menu, bookings modal)
│   │   └── reservationform.js      # Seat map + meal selector logic
│   └── styles/
│       └── main.css                # Shared styling
├── routes/
│   ├── bookingRoutes.js            # REST API + booking page routes
│   └── loginRoutes.js              # Auth/profile route registrations
├── views/
│   ├── layouts/
│   │   └── main.handlebars         # Base layout with header/footer
│   ├── partials/
│   │   ├── footer.handlebars
│   │   ├── header.handlebars
│   │   └── profileToggle.handlebars
│   ├── sprites/
│   │   └── dlsu-airlines.png
│   ├── admin.handlebars            # Admin landing page
│   ├── availableFlights.handlebars # Flights search results
│   ├── bookings.handlebars         # Booking modal content
│   ├── change-password.handlebars
│   ├── detail.handlebars           # Reservation detail page
│   ├── edit-profile.handlebars
│   ├── error.handlebars
│   ├── error404.handlebars
│   ├── loginform.handlebars
│   ├── register.handlebars
│   ├── reservationForm.handlebars
│   ├── reservations.handlebars
│   └── searchPage.handlebars
└── server.js                       # Express bootstrap + route wiring
```

## Directory Highlights

- **config/** – environment/configuration helpers, currently just MongoDB bootstrap.
- **controllers/** – request handlers separated by domain (auth, admin, flight search).
- **models/** – Mongoose schemas for flights, bookings, and user profiles.
- **public/** – static assets served by Express (`main.js` also covers login/register button routing).
- **routes/** – Express routers that attach controller actions under `/flights`, `/loginOrRegister`, and booking APIs.
- **views/** – Handlebars templates, partials, and layout. The off-canvas profile dropdown lives in `partials/profileToggle.handlebars`.

To run the MVC server locally:

```
cd MVC
npm install
npm start
```

The app serves static assets from `public/`, renders pages through `views/`, and talks to MongoDB using the models and helpers listed above.
