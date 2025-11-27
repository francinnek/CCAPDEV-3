const Flight = require('../models/Flight');

const adminController = {
    // Show admin dashboard
    showAdminPage: (req, res) => {
        res.render('admin', {
            title: 'Admin Dashboard - DLSU Airlines',
            user: req.session.user
        });
    },

    // GET all flights (for API)
    getFlights: async (req, res) => {
        try {
            const flights = await Flight.find().sort({ departureTime: 1 });
            res.json(flights);
            console.log(`✅ All flights fetched successfully.`);
        } catch (error) {
            console.error('❌ Error fetching flights:', error);
            res.status(500).json({ error: 'Failed to fetch flights' });
        }
    },

    // CREATE new flight
    createFlight: async (req, res) => {
        try {
            const { flightNumber, origin, destination, departureTime, price, seats } = req.body;
            
            const newFlight = new Flight({
                flightNumber,
                origin,
                destination,
                departureTime,
                price,
                seats,
                availableSeats: seats
            });

            await newFlight.save();
            console.log(`✅ Flight created successfully.`);
            res.json({ success: true, message: 'Flight created successfully', flight: newFlight });
        } catch (error) {
            console.error('❌ Error creating flight:', error);
            res.status(500).json({ error: 'Failed to create flight' });
        }
    },

    // UPDATE flight
    updateFlight: async (req, res) => {
        try {
            const { id } = req.params;
            const { flightNumber, origin, destination, departureTime, price, seats } = req.body;

            const updatedFlight = await Flight.findByIdAndUpdate(
                id,
                {
                    flightNumber,
                    origin,
                    destination,
                    departureTime,
                    price,
                    seats,
                    availableSeats: seats // Reset available seats when updating total seats
                },
                { new: true }
            );

            if (!updatedFlight) {
                return res.status(404).json({ error: 'Flight not found' });
            }

            console.log(`✅ Flight updated successfully.`);
            res.json({ success: true, message: 'Flight updated successfully', flight: updatedFlight });
        } catch (error) {
            console.error('❌ Error updating flight:', error);
            res.status(500).json({ error: 'Failed to update flight' });
        }
    },

    // DELETE flight
    deleteFlight: async (req, res) => {
        try {
            const { id } = req.params;
            
            const deletedFlight = await Flight.findByIdAndDelete(id);
            
            if (!deletedFlight) {
                return res.status(404).json({ error: 'Flight not found' });
            }

            console.log(`✅ Flight deleted successfully.`);
            res.json({ success: true, message: 'Flight deleted successfully' });
        } catch (error) {
            console.error('❌ Error deleting flight:', error);
            res.status(500).json({ error: 'Failed to delete flight' });
        }
    },

    // GET single flight (for editing)
    getFlight: async (req, res) => {
        try {
            const { id } = req.params;
            const flight = await Flight.findById(id);
            
            if (!flight) {
                return res.status(404).json({ error: 'Flight not found' });
            }

            console.log(`✅ getFlight successful.`);
            res.json(flight);
        } catch (error) {
            console.error('❌ Error fetching flight:', error);
            res.status(500).json({ error: 'Failed to fetch flight' });
        }
    }
};

module.exports = adminController;