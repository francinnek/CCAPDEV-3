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
        console.log(`📊 Found ${flights.length} flights from database`);
        
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

// GET /flights/available - Show all flights or filtered flights
/*router.get('/available', async (req, res) => {
    try {
        const flightSearch = req.query.flightSearch;
        const flight_results = await Flight.find({
            $or: [
                { origin: { $regex: flightSearch, $options: 'i' } },
                { destination: { $regex: flightSearch, $options: 'i' } }
            ]
        }).then((flight) => {
            console.log(flight);
            res.status(200).render('availableFlights', flight_results);
        }).catch((error) => {
            console.error('Error fetching flights:', error);
            res.status(500).json({ error: 'Failed to fetch flight results' });
        })
        /*const { origin, destination, departure } = req.query || "";
        const flight = await Flight.find({
            origin: { $regex: origin, $options: 'i' },
            destination: { $regex: destination, $options: 'i' },
            departure_date: departure
        }).sort({createdAt: -1});
        
        return res.status(200).render('availableFlights', flight);
        let searchQuery = {};
        
        // Add search filters if provided
        if (origin) {
            searchQuery.origin = { $regex: origin, $options: 'i' };
        }
        
        if (destination) {
            searchQuery.destination = { $regex: destination, $options: 'i' };
        }
        
        if (departure) {
            searchQuery.departure_date = departure;
        }

        const flights = await Flight.find(searchQuery).sort({ price: 1 });
        
        const hasSearchCriteria = origin || destination || departure;
        const noResultsWithCriteria = hasSearchCriteria && flights.length === 0;

        res.render('availableFlights', {
            title: 'Available Flights',
            active: { book: true },
            searchParams: req.query,
            flights: flights,
            noResultsWithCriteria: noResultsWithCriteria,
            searchOrigin: origin,
            searchDestination: destination
        });
    } catch (error) {
        console.error('Error fetching flights:', error);
        res.status(500).json({ error: 'Failed to fetch flights' });
    }
});*/

module.exports = router;