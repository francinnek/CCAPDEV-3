// ========================= IMPORTS ==========================
const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');

const connectDb = require('./config/database');

const Available_Flight = require('./controllers/available_flightsController');
// const loginRegController = require('./routes/loginRoutes');
const BookingController = require('./controllers/bookingController');

const Booking = require('./models/Booking');
//const Profile = require('./models/Profile');
// const Flight = require('./models/Available_Flight');

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
                // Format for HTML date input (YYYY-MM-DD)
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            } else {
                // Default format (MM-DD-YYYY)
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const year = d.getFullYear();
                return `${month}-${day}-${year}`;
            }
        }
    }
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// ===================== MIDDLEWARE ======================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// the picture
app.use('/sprites', express.static(path.join(__dirname, 'views/sprites')));

// ===================== ROUTES ======================
app.use('/flights', Available_Flight);
// app.use('/loginOrRegister', loginRegController);
app.use('/bookings', BookingController);

// app.get('/search', (req, res) => res.sendFile(path.join(__dirname, 'search_page.html'))); 
// app.get('/avail',  (req, res) => res.sendFile(path.join(__dirname, 'availFlights.html'))); 
// app.get('/form',   (req, res) => res.sendFile(path.join(__dirname, 'reservationform.html'))); 
/*
app.get('/', (req, res) => {
    res.redirect('/loginOrRegister/login'); 
});
*/
app.get('/', (req, res) => {
    res.redirect('/reservations'); 
});

app.get('/form', (req, res) => {
    res.render('reservationForm', {
        title: 'Book Flight - DLSU Airlines',
        active: { book: true }
    });
});

app.get('/admin', async (req, res) => {
    try {
        const username = req.query.user;
        const message = req.query.message;
        
        let profile = null;

        if (username) {
            profile = await Profile.findOne({ 
                $or: [
                    { username: username },
                    { email: username }
                ]
            }).lean();
        }

        res.render('admin', {
            title: 'Admin Dashboard - DLSU Airlines',
            profile: profile,
            message: message
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.render('admin', {
            title: 'Admin Dashboard - DLSU Airlines',
            profile: null
        });
    }
});


// Bowen's routes
app.use('/bookings', BookingController);



app.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'confirmed' }).lean();
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving bookings' });
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



// Show My Reservations page
app.get('/reservations', async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'confirmed' }).lean();
        res.render('reservations', {
            title: 'My Reservations - DLSU Airlines',
            active: { reservations: true },
            bookings: bookings
        });
    } catch (err) {
        res.status(500).send('Error');
    }
});


// Detail page for a single reservation
app.get('/reservations/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).lean();
        if (booking) {
            res.render('detail', { 
                title: 'Reservation Details - DLSU Airlines',
                booking: booking
            });
        } else {
            res.status(404).send('Reservation not found');
        }
    } catch (err) {
        res.status(400).send('Invalid reservation ID');
    }
});

app.post('/bookings', async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
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
    console.log('📥 Connected to MongoDB');

    app.listen(PORT, async () => {
      console.log('🚀 DLSU Airlines Server Started Successfully!');
      const url = `http://localhost:${PORT}`;
      console.log(`Server is running at ${url}`);
      console.log('='.repeat(50));
    });
  })
  .catch(err => {
    console.error('❎ Failed to connect to MongoDB:', err);
    process.exit(1);
});