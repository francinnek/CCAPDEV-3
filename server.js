// ========================= IMPORTS ==========================
const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');

const connectDb = require('./config/database');

const Available_Flight = require('./controllers/available_flightsController');
const loginRegController = require('./routes/loginRoutes');

const Booking = require('./models/Booking');
const Profile = require('./models/Profile');
const Flight = require('./models/Available_Flight');

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

// ===================== ROUTES ======================
app.use('/flights', Available_Flight);
app.use('/loginOrRegister', loginRegController);

app.get('/', (req, res) => {
    res.redirect('/loginOrRegister/login'); 
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
            message: message // Pass success message to template
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.render('admin', {
            title: 'Admin Dashboard - DLSU Airlines',
            profile: null
        });
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
      console.log('='.repeat(50));
    });
  })
  .catch(err => {
    console.error('❎ Failed to connect to MongoDB:', err);
    process.exit(1);
});