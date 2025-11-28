/* ========================= IMPORTS ========================== */
const session = require('express-session');
// const bcrypt = require('bcrypt');
const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');

const connectDb = require('./config/database');
// logging.js
const saveLog = require('./controllers/logger');

const availableFlightsController = require('./controllers/available_flightsController');
const Available_Flight = require('./models/Available_Flight');
const loginRegController = require('./routes/loginRoutes');

const flightManagementRoutes = require('./routes/flightRoutes');
const usersRoutes = require('./routes/usersRoutes'); 
const bookingRoutes = require('./routes/bookingRoutes');

const Booking = require('./models/Booking');
const Profile = require('./models/Profile');
const validation = require('./utils/validation');

const app = express();
const PORT = 3000;

/* ===================== HANDLEBARS SETUP ====================== */
app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    extname: '.handlebars',
    helpers: {
    formatDate: function(date, formatType) {
        if (!date) return 'Not set';
        const d = new Date(date);
        
        if (formatType === 'input') {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } else {
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const year = d.getFullYear();
            return `${month}-${day}-${year}`;
        }
    },

    // ✅ New helper: safely outputs raw JSON into HTML for use in <script>
    json: function(context) {
      return JSON.stringify(context);
    },

    // ✅ Add these:
    inc: function (value) {
      const n = Number(value);
      return isNaN(n) ? value : n + 1;
    },
    neq: function (a, b) {
      // compare safely even if ObjectId objects
      return String(a) !== String(b);
    }
  }

}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

/* ===================== MIDDLEWARE ====================== */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/sprites', express.static(path.join(__dirname, 'views/sprites')));
// Authentication middleware - centralized file
const userRoleAuth = require('./userAuth-middleware/userRoleAuth');

/* ===================== SESSION CONFIGURATION ====================== */
app.use(session({
    secret: 'dlsu-airlines-secret-key', // kind of like the "master password" to encrypt session data. Hardcoded.
    resave: false, // When false, it WON'T save the session back to storage if nothing changed
    saveUninitialized: false, // When false, it WON'T create empty sessions. It only creates sessions when you actually put data in them
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // Session expires after 24 hours (calculated in milliseconds)
    }
}));

app.use((req, res, next) => {
    // Pass session user to all templates as 'profile'
    res.locals.profile = req.session.user || null;
    next();
});

/*

- "Make user data available to all web pages"
    res.locals.profile = Create a shared variable called "profile" for all templates
    req.session.user = Get the logged-in user's information
    || null = "If no one is logged in, use empty/nothing"

*/

/* ===================== ROUTES ====================== */
app.use('/flights', availableFlightsController);
app.use('/admin/flights', userRoleAuth('admin'), flightManagementRoutes);
app.use('/admin/users', userRoleAuth('admin'), usersRoutes);
app.use('/loginOrRegister', loginRegController);
app.use('/book', userRoleAuth('user'), bookingRoutes);

// For now, the check-in is public, do we need to add userRoleAuth('user')???
app.use('/', require('./routes/checkinRoutes'));

app.get('/', (req, res) => {
    res.redirect('/loginOrRegister/login'); 
});

app.get('/form', userRoleAuth('user'), async (req, res) => {
    try {
        const username = req.session.user.username;  
        let profile = null;
        if (username) {
            profile = await Profile.findOne({ 
                $or: [
                    { username: username },
                    { email: username }
                ]
            }).lean();
        }

        const flightData = {
            price: req.query.price,
            origin: req.query.origin,
            destination: req.query.destination,
            airline: req.query.airline,
            departure: req.query.flightDeparture,
            arrival: req.query.flightArrival
        };
        // include flightId if provided so the client can send it back for atomic seat reservation
        if (req.query.flightId) {
            flightData._id = req.query.flightId;
        }

        res.render('reservationForm', {
            title: 'Book Flight - DLSU Airlines',
            active: { book: true }, 
            flight: flightData,
            profile: profile,
            username: username  // NOW COMES FROM SESSION
        });
        saveLog(username, `✅ ${req.session?.user?.email || 'unknown'} successfully loaded the form!`);
    } catch (err) {
        console.error('❌ SECURITY: Error loading form:', err);
        saveLog(username, `❌ ${req.session?.user?.email || 'unknown'} failed to load form.`);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error loading reservation form'
        });
    }
});

app.get('/admin', async (req, res) => {
    try {
        const username = req.session.user.username;
        const message = req.query.message;
        
        let profile = null;
        let isAdmin = req.session.user.isAdmin || false;

        if (username) {
            profile = await Profile.findOne({ 
                $or: [
                    { username: username },
                    { email: username }
                ]
            }).lean();
            
            if (profile) {
                isAdmin = profile.isAdmin === true;
            }
        }

        res.render('admin', {
            title: 'Admin Dashboard - DLSU Airlines',
            profile: profile,
            isAdmin: isAdmin,
            username: username,
            message: message
        });
        //saveLog(username, `✅ ${req.session.user.email} successfully fetched user profile!`);
    } catch (error) {
        saveLog(username, `❌ ${req.session?.user?.email || 'unknown'} failed to fetch user profile.`);
        console.error('❌ SECURITY: Error fetching user profile:', error);
        res.render('admin', {
            title: 'Admin Dashboard - DLSU Airlines',
            profile: profile,
            isAdmin: false
        });
    }
});

app.put('/bookings/:id', userRoleAuth('user'), async (req, res) => {
    try {
        // Modify booking with seat-reservation safety. If changing seat, ensure new seat is reserved atomically
        const bookingId = req.params.id;
        const newSeat = req.body.selectedSeat;
        const flightPrice = req.body.flightPrice || 0;
        const extraBaggage = req.body.extraBaggage || 0;

        const existingBooking = await Booking.findById(bookingId);
        if (!existingBooking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Only the booking owner may modify their booking
        if (req.session.user?.username && existingBooking.username !== req.session.user.username) {
            return res.status(403).json({ error: 'You do not have permission to modify this booking' });
        }

        // If seat is changing and this booking references a flight, attempt to reserve the new seat first
        if (newSeat && existingBooking.selectedSeat !== newSeat) {
            if (!existingBooking.flightId) {
                return res.status(400).json({ error: 'Cannot change seat: booking has no associated flightId' });
            }

            // Validate new seat
            const seatValidation = validation.validateSeat(String(newSeat));
            if (!seatValidation.isValid) {
                return res.status(400).json({ error: seatValidation.error });
            }

                // Remember old seat to release later
                const oldSeat = existingBooking.selectedSeat;

                // Try to reserve new seat atomically
                const reserved = await Available_Flight.findOneAndUpdate(
                    { _id: existingBooking.flightId, bookedSeats: { $ne: seatValidation.sanitized } },
                    { $push: { bookedSeats: seatValidation.sanitized } },
                    { new: true }
                );

            if (!reserved) {
                return res.status(409).json({ error: 'Selected seat is already booked. Please choose a different seat.' });
            }

            // Update booking to new seat and other fields
            existingBooking.selectedSeat = seatValidation.sanitized;
            existingBooking.mealOption = req.body.mealOption;
            existingBooking.extraBaggage = extraBaggage;
            existingBooking.baggagePrice = extraBaggage * 60;
            existingBooking.totalPrice = flightPrice + (extraBaggage * 60);
            await existingBooking.save();

            // Release old seat (best-effort; if this fails it's acceptable as system still prevents double-booking)
            try {
                if (oldSeat) {
                    await Available_Flight.updateOne(
                        { _id: existingBooking.flightId },
                        { $pull: { bookedSeats: oldSeat } }
                    );
                }
            } catch (e) {
                console.warn('Warning: failed to release old seat after updating booking', e.message);
            }

            return res.json({ success: true, message: 'Booking updated successfully' });
        }

        // No seat change - simply update other fields
        existingBooking.mealOption = req.body.mealOption || existingBooking.mealOption;
        existingBooking.extraBaggage = extraBaggage;
        existingBooking.baggagePrice = extraBaggage * 60;
        existingBooking.totalPrice = flightPrice + (extraBaggage * 60);
        await existingBooking.save();

        return res.json({ success: true, message: 'Booking updated successfully' });
    } catch (err) {
        console.error('Error updating booking:', err);
        res.status(400).json({ error: err.message });
    }
});

app.get('/bookings/:id/edit', userRoleAuth('user'), async (req, res) => {
    try {

        const username = req.session.user.username;
        let profile = null;
        if (username) {
            profile = await Profile.findOne({ 
                $or: [
                    { username: username },
                    { email: username }
                ]
            }).lean();
        }

        const booking = await Booking.findById(req.params.id).lean();
        if (!booking) {
            return res.status(404).render('error', {
                title: 'Not Found',
                message: 'Booking not found'
            });
        }

        

        res.render('reservationForm', {
            title: 'Modify Reservation - DLSU Airlines',
            active: { book: true },
            flight: {
                _id: booking.flightId,
                origin: booking.origin,
                destination: booking.destination,
                airline: booking.airline,
                departure: booking.flightDeparture,
                arrival: booking.flightArrival,
                price: booking.flightPrice
            },
            booking: booking,
            isModification: true,
            profile: profile
        });
    } catch (err) {
        console.error('Error fetching booking for modification:', err);
        res.status(400).render('error', {
            title: 'Error',
            message: 'Invalid booking ID'
        });
    }
});

app.get('/reservations', userRoleAuth('user'), async (req, res) => {
    try {
        const username = req.session.user.username;
        let profile = null;
        let bookings = [];
        
        if (username) {
            profile = await Profile.findOne({ 
                $or: [
                    { username: username },
                    { email: username }
                ]
            }).lean();

            // Filter bookings by username and status
            const query = { status: { $ne: 'cancelled' }, username: username };
            bookings = await Booking.find(query).lean();
            saveLog(username, `📋 Fetching reservations for user: ${username}.`);
        } else {
            const guestUsername = 'guest';
            // guest logging fallback
            saveLog(req.session?.user?.username || 'guest', `⚠️ Not registered/logged in - guest user cannot view reservations`);
            // Guest users see NO reservations
            bookings = []; // empty array/list of bookings
        }
        
        res.render('reservations', { 
            title: 'My Reservations - DLSU Airlines',
            bookings: bookings,
            profile: profile
        });
        saveLog(req.session?.user?.username || username || 'guest', `✅ ${req.session?.user?.email || 'unknown'} successfully retrieved reservations.`);
    } catch (err) {
        saveLog(req.session?.user?.username || username || 'guest', `❌ ${req.session?.user?.email || 'unknown'} failed to retrieve reservations.`);
        console.error('Error retrieving reservations:', err);
        res.status(500).send('Error retrieving reservations');
    }
});

app.get('/bookings', userRoleAuth('user'), async (req, res) => {
    try {
        const username = req.session.user?.username;

        /*
            > const username — declares a constant named username (cannot be reassigned).
            > req — usually the Express request object.
            > req.session — commonly created by express-session, 
                          used to store info about the session.
            > req.session.user — typically a user object you stored 
                               into the session, for example { username: 'alice', id: 123 }.
            > ?. — optional chaining operator. 
                 It checks whether the value on the left is not null or undefined. 
                 If it is null or undefined, the whole expression evaluates to 
                 undefined without throwing an error. If it exists, it 
                 accesses the property to the right (here .username).
        */
        
        // Only return bookings if username is provided
        if (!username) {
            // console.log('⚠️ No username provided to /bookings - returning empty array');
            return res.json([]);
        }
        // not equal to cancelled
        const query = { status: { $ne: 'cancelled' }, username: username };
        const bookings = await Booking.find(query).lean();
        res.json(bookings);
        saveLog(req.session?.user?.username || username || 'guest', `✅ ${req.session?.user?.email || 'unknown'} successfully retrieved the bookings.`);
    } catch (err) {
        saveLog(req.session?.user?.username || username || 'guest', `❌ ${req.session?.user?.email || 'unknown'} failed to retrieve the bookings.`);
        res.status(500).json({ error: 'Error retrieving bookings' });
    }
});

app.post('/bookings', userRoleAuth('user'), async (req, res) => {
    try {
        // Expecting flightId and selectedSeat in request body for atomic seat reservation
        const { flightId, selectedSeat } = req.body;

        if (!flightId) {
            return res.status(400).json({ error: 'Missing flightId' });
        }

        // Validate flightId format
        const flightIdValidation = validation.validateMongoId(String(flightId));
        if (!flightIdValidation.isValid) {
            return res.status(400).json({ error: 'Invalid flightId' });
        }

        // Validate seat format
        const seatValidation = validation.validateSeat(String(selectedSeat || ''));
        if (!seatValidation.isValid) {
            return res.status(400).json({ error: seatValidation.error });
        }

        // Attempt to reserve the seat atomically 
        const flightUpdate = await Available_Flight.findOneAndUpdate(
            { _id: flightId, bookedSeats: { $ne: seatValidation.sanitized } }, 
            //will only push if seat is not already present
            { $push: { bookedSeats: seatValidation.sanitized } }, 
            { new: true }
        );

        if (!flightUpdate) {
            // Either flight not found or seat already taken
            // Check if flight exists to give a clearer error
            const flightExists = await Available_Flight.exists({ _id: flightId });
            if (!flightExists) {
                return res.status(404).json({ error: 'Flight not found' });
            }

            return res.status(409).json({ error: 'Selected seat is already booked. Please choose a different seat.' });
        }

        // Seat reserved successfully on flight document; now create booking
        // Ensure booking.username comes from session (prevent spoofing)
        req.body.username = req.session.user?.username || req.body.username;
        // Normalize the selectedSeat to sanitized value before saving
        req.body.selectedSeat = seatValidation.sanitized;
        const booking = new Booking(req.body);
        await booking.save();
        res.json({ success: true });
        saveLog(req.session?.user?.username || username || 'guest', `✅ ${req.session?.user?.email || 'unknown'} successfully created a new booking.`);
    } catch (err) {
        saveLog(req.session?.user?.username || username || 'guest', `❌ ${req.session?.user?.email || 'unknown'} failed to create a new booking.`);
        // console.error(`SECURITY: Booking creation failed for user: ${req.session.user?.username}`, err);
        res.status(400).json({ error: err.message });
    }
});

app.get('/bookings/:id', userRoleAuth('user'), async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).lean();
        if (booking) {
            res.json(booking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (err) {
        res.status(400).json({ error: 'Invalid booking ID' });
    }
});

// Detail page for a single reservation
app.get('/reservations/:id', userRoleAuth('user'), async (req, res) => {
    try {
        // Attempt to load profile if a username/email query param was provided
        const username = req.session.user?.username; 
        let profile = null;
        if (username) {
            profile = await Profile.findOne({ 
                $or: [
                    { username: username },
                    { email: username }
                ]
            }).lean();
        }

        const booking = await Booking.findById(req.params.id).lean();
        if (booking) {
            // Verify the booking belongs to the user
            if (username && booking.username !== username) {
                return res.status(403).render('error', {
                    title: 'Access Denied',
                    message: 'You do not have permission to view this reservation.'
                });
            }
            
            res.render('detail', { 
                title: 'Reservation Details - DLSU Airlines',
                booking: booking,
                profile: profile
            });
        } else {
            res.status(404).send('Reservation not found');
        }
    } catch (err) {
        console.error('Error fetching reservation:', err);
        res.status(400).send('Invalid reservation ID');
    }
});

app.post('/reservations/:id/cancel', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).send('Reservation not found');
        }

        // Mark booking cancelled
        booking.status = 'cancelled';
        await booking.save();

        // Release booked seat from flight (best-effort)
        try {
            if (booking.flightId && booking.selectedSeat) {
                await Available_Flight.updateOne(
                    { _id: booking.flightId },
                    { $pull: { bookedSeats: booking.selectedSeat } }
                );
            }
        } catch (e) {
            console.warn('Warning: failed to release seat on cancel', e.message);
        }

        res.redirect('/reservations');
        saveLog(req.session?.user?.username || username || 'guest', `✅ ${req.session?.user?.email || 'unknown'} successfully cancelled the reservation/booking.`);
    } catch (err) {
        saveLog(req.session?.user?.username || username || 'guest', `❌ ${req.session?.user?.email || 'unknown'} failed to cancel the reservation.`);
        res.status(500).send('Error cancelling reservation');
    }
});

// app.get('/logout', (req, res) => {
//     console.log(`🔐 SECURITY: User logged out: ${req.session.user?.username} from IP: ${req.ip}`);
//     req.session.destroy((err) => {
//         if (err) {
//             console.error('❌ SECURITY: Session destruction error:', err);
//         }
//         res.redirect('/loginOrRegister/login?message=Logged out successfully');
//     });
// });


/* ===================== ERROR HANDLING ====================== */

app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist.'
    });
});

// Basic error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).render('error', {
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.'
    });
});

connectDb()
  .then(() => {
    console.log('='.repeat(50));
    console.log('🔥 Connected to MongoDB');

    // Bind to all network interfaces for external access
    app.listen(PORT, '0.0.0.0', async () => {
      console.log('🚀 DLSU Airlines Server Started Successfully!');
      console.log('='.repeat(50));
    });
  })
  .catch(err => {
    console.error('❎ Failed to connect to MongoDB:', err);
    process.exit(1);
});