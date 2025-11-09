# MVC Folder Structure

This file lists the folder contents for the `Reservations` requirement part (files and directories) as they exist in the project.

```
MVC/
├── config/
│   └── database.js
├── controllers/
│   └── available_flightsController.js
├── models/
│   ├── Available_Flight.js
│   └── Booking.js
├── public/
│   └── styles/
│       └── main.css
├── views/
│   ├── layouts/
│   │   └── main.handlebars
│   ├── partials/
│   │   ├── footer.handlebars
│   │   └── header.handlebars
│   ├── sprites/
│   │   └── dlsu-airlines.png
│   ├── availableFlights.handlebars
│   ├── bookings.handlebars
│   ├── detail.handlebars
│   ├── error.handlebars
│   ├── error404.handlebars
│   ├── reservationForm.handlebars
│   ├── reservations.handlebars
│   └── searchPage.handlebars
└── server.js
```

Notes:
- The `views/partials` and `views/layouts` folders contain the Handlebars partials and layout files used by the app.
- If you want a nested tree that includes file sizes or last-modified dates, tell me and I can add those.
