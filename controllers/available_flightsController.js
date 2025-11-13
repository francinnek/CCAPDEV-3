const express = require('express');
const router = express.Router();
const Flight = require('../models/Available_Flight');
const Profile = require('../models/Profile');

router.get('/search', async (req, res) => {
    try {
    const username = req.query.user;
       // console.log('🔍 /search route - username from query:', username);
        let profile = null;
        
          if (username) {
              // console.log('🔐 Looking up profile for search page');
            profile = await Profile.findOne({ 
                $or: [
                    { username: username },
                    { email: username }
                ]
            }).lean();
           // console.log('✅ Profile found:', profile ? `YES (${profile.username})` : 'NO');
        }
        
        res.render('searchPage', {
            title: 'Search Flights - DLSU Airlines',
            active: { search: true },
            profile: profile 
        });
    } catch (error) {
        console.error('Error loading search page:', error);
        res.render('searchPage', {
            title: 'Search Flights - DLSU Airlines',
            active: { search: true },
            profile: null
        });
    };
});

// API endpoint to get available origins and destinations
router.get('/origins-destinations', async (req, res) => {
    try {
        const flights = await Flight.find({}).distinct('origin');
        const destinations = await Flight.find({}).distinct('destination');
        
        res.json({
            origins: flights.sort(),
            destinations: destinations.sort()
        });
    } catch (error) {
        console.error('Error fetching origins and destinations:', error);
        res.status(500).json({ 
            error: 'Error fetching airport options',
            origins: [],
            destinations: []
        });
    }
});

router.post('/search', async (req, res) => {
    try {
        const { origin, destination, departureDate } = req.body;
        const searchQuery = {};
        
        if (origin && typeof origin === 'string' && origin.trim()) {
            searchQuery.origin = { $regex: origin.trim(), $options: 'i' };
        }
        
        if (destination && typeof destination === 'string' && destination.trim()) {
            searchQuery.destination = { $regex: destination.trim(), $options: 'i' };
        }
        
        if (departureDate) {
            searchQuery.departureDate = new Date(departureDate);
        }

    // console.log('Search query:', searchQuery);
        
        const flights = await Flight.find(searchQuery).lean();
        res.json(flights);
        
    } catch (error) {
        console.error('Error searching flights:', error);
        res.status(500).json({ 
            error: 'Error searching flights',
            message: error.message 
        });
    }
});

router.get('/avail', async (req, res) => {
    try {
    const username = req.query.user;
    // console.log('🔍 /avail route - username from query:', username);
        let profile = null;
        
        if (username) {
            // console.log('🔐 Looking up profile for username:', username);
            profile = await Profile.findOne({ 
                $or: [
                    { username: username },
                    { email: username }
                ]
            }).lean();
            // console.log('✅ Profile lookup result:', profile ? `FOUND (username: ${profile.username})` : 'NOT FOUND');
        } else {
            // console.log('⚠️ No username provided in query params');
        }

        // If search origin/destination provided, filter on server to avoid sending all flights
        const { origin, destination } = req.query;
        const searchQuery = {};
        if (origin && typeof origin === 'string' && origin.trim()) {
            searchQuery.origin = { $regex: origin.trim(), $options: 'i' };
        }
        if (destination && typeof destination === 'string' && destination.trim()) {
            searchQuery.destination = { $regex: destination.trim(), $options: 'i' };
        }

        const flights = await Flight.find(searchQuery).lean();
    // console.log(`📊 Rendering availableFlights with ${flights.length} flights (filter: ${JSON.stringify(searchQuery)}) and profile:`, profile ? 'YES' : 'NO');

        res.render('availableFlights', {
            title: 'Available Flights - DLSU Airlines',
            active: { book: true },
            flights: flights,
            profile: profile,
            isAdmin: profile?.isAdmin === true
        });

    } catch (error) {
        console.error('Error loading available flights page:', error);
        res.status(500).render('error', {
            title: 'Server Error',
            message: 'Error loading flights page'
        });
    }
});


module.exports = router;