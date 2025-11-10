const express = require('express');
const router = express.Router();
const Flight = require('../models/Available_Flight');

router.get('/search', (req, res) => {
    res.render('searchPage', {
        title: 'Search Flights - DLSU Airlines',
        active: { search: true }
    });
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

        console.log('Search query:', searchQuery);
        
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
        const flights = await Flight.find({}).lean();
        
        res.render('availableFlights', {
            title: 'Available Flights - DLSU Airlines',
            active: { book: true },
            flights: flights
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