// ========================= IMPORTS ==========================
const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');

const connectDb = require('./config/database');

const Available_Flight = require('./controllers/available_flightsController');
const loginRegController = require('./routes/loginRoutes');

const flightManagementRoutes = require('./routes/flightRoutes');
const usersRoutes = require('./routes/usersRoutes'); 
// const Book = require('./routes/bookingRoutes');

const Booking = require('./models/Booking');
const Profile = require('./models/Profile');

const app = express();
const PORT = 3000;

// ===================== HANDLEBARS SETUP ======================
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

// ===================== MIDDLEWARE ======================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/sprites', express.static(path.join(__dirname, 'views/sprites')));

// ===================== ROUTES ======================
app.use('/flights', Available_Flight);
// Admin flight management routes
app.use('/admin/flights', flightManagementRoutes);
app.use('/admin/users', usersRoutes);
app.use('/loginOrRegister', loginRegController);
// app.use('/reservations', Book);

app.get('/', (req, res) => {
    res.redirect('/loginOrRegister/login'); 
});

app.get('/form', async (req, res) => {
    try {
        const flightData = {
            price: req.query.price,
            origin: req.query.origin,
            destination: req.query.destination,
            airline: req.query.airline,
            departure: req.query.flightDeparture,
            arrival: req.query.flightArrival
        };

        // Fetch user profile if username is provided
        const username = req.query.user;
        let profile = null;
        if (username) {
            profile = await Profile.findOne({ 
                $or: [
                    { username: username },
                    { email: username }
                ]
            }).lean();
        }

        res.render('reservationForm', {
            title: 'Book Flight - DLSU Airlines',
            active: { book: true }, 
            flight: flightData,
            profile: profile,
            username: username
        });
    } catch (err) {
        console.error('Error loading form:', err);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error loading reservation form'
        });
    }
});

app.get('/admin', async (req, res) => {
    try {
        const username = req.query.user;
        const message = req.query.message;
        
        let profile = null;
        let isAdmin = false;

        if (username) {
            profile = await Profile.findOne({ 
                $or: [
                    { username: username },
                    { email: username }
                ]
            }).lean();
            
            // Verify admin status from profile
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
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.render('admin', {
            title: 'Admin Dashboard - DLSU Airlines',
            profile: profile,
            isAdmin: false
        });
    }
});

app.put('/bookings/:id', async (req, res) => {
    try {
    // console.log('📝 Modifying booking:', req.params.id);
        
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            {
                selectedSeat: req.body.selectedSeat,
                mealOption: req.body.mealOption,
                extraBaggage: req.body.extraBaggage,
                baggagePrice: (req.body.extraBaggage || 0) * 60,
                totalPrice: (req.body.flightPrice || 0) + ((req.body.extraBaggage || 0) * 60)
            },
            { new: true, runValidators: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json({ 
            success: true, 
            message: 'Booking updated successfully'
        });
    } catch (err) {
        console.error('Error updating booking:', err);
        res.status(400).json({ error: err.message });
    }
});

app.get('/bookings/:id/edit', async (req, res) => {
    try {

        const username = req.query.user;
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


// Bowen's routes
app.get('/reservations', async (req, res) => {
    try {
        const username = req.query.user;
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
            const query = { status: 'confirmed', username: username };
            bookings = await Booking.find(query).lean();
            // console.log(`📋 Fetching reservations for user: ${username} - Found ${bookings.length}`);
        } else {
            // console.log(`⚠️ No username provided - guest user cannot view reservations`);
            // Guest users see NO reservations
            bookings = [];
        }
        
        res.render('reservations', { 
            title: 'My Reservations - DLSU Airlines',
            bookings: bookings,
            profile: profile
        });
    } catch (err) {
        console.error('❌ Error retrieving reservations:', err);
        res.status(500).send('Error retrieving reservations');
    }
});

app.get('/bookings', async (req, res) => {
    try {
        const username = req.query.user;
        
        // Only return bookings if username is provided
        if (!username) {
            // console.log('⚠️ No username provided to /bookings - returning empty array');
            return res.json([]);
        }
        
        const query = { status: 'confirmed', username: username };
        const bookings = await Booking.find(query).lean();
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving bookings' });
    }
});

app.post('/bookings', async (req, res) => {
    try {
        // console.log('📝 Creating booking with data:', {
        //     username: req.body.username,
        //     name: req.body.name,
        //     email: req.body.email
        // });
        
        const booking = new Booking(req.body);
        await booking.save();
        
    // console.log('✅ Booking created successfully for user:', req.body.username);
        res.json({ success: true });
    } catch (err) {
        console.error('❌ Error creating booking:', err.message);
        res.status(400).json({ error: err.message });
    }
});

app.get('/bookings/:id', async (req, res) => {
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
app.get('/reservations/:id', async (req, res) => {
    try {
        // Attempt to load profile if a username/email query param was provided
        const username = req.query.user;
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
        await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
        res.redirect('/reservations');
    } catch (err) {
        res.status(500).send('Error cancelling reservation');
    }
});

// app.post('/reservations/:id/cancel', async (req, res) => {
//     try {
//         await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
//         // If request is AJAX, respond with JSON for client-side handler
//         if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
//             return res.json({ success: true });
//         }

//         // Fall back to redirect for normal form submissions
//         res.redirect('/reservations');
//     } catch (err) {
//         console.error('Error cancelling reservation:', err);
//         res.status(500).send('Error cancelling reservation');
//     }
// });


// ===================== ERROR HANDLING ======================

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