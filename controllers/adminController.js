const Flight = require('../models/Flight');
const saveLog = require('./logger');

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
            saveLog(req.session.user.username, `✅ All flights fetched successfully for ${req.session.user.email}.`);
        } catch (error) {
            saveLog(req.session.user.username, `❌ Error fetching flights for ${req.session.user.email}.`);
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
            saveLog(req.session.user.username, `✅ Flight created successfully for ${req.session.user.email}.`);
            res.json({ success: true, message: 'Flight created successfully', flight: newFlight });
        } catch (error) {
            saveLog(req.session.user.username, `❌ Error creating flight for ${req.session.user.email}.`);
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

            saveLog(req.session.user.username, `✅ Flight updated successfully for ${req.session.user.email}.`);
            res.json({ success: true, message: 'Flight updated successfully', flight: updatedFlight });
        } catch (error) {
            saveLog(req.session.user.username, `❌ Error updating flight for ${req.session.user.email}.`);
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

            saveLog(req.session.user.username, `✅ Flight deleted successfully for ${req.session.user.email}.`);
            res.json({ success: true, message: 'Flight deleted successfully' });
        } catch (error) {
            saveLog(req.session.user.username, `❌ Error deleting flight for ${req.session.user.email}.`);
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

            saveLog(req.session.user.username, `✅ getFlight successful for ${req.session.user.email}.`);
            res.json(flight);
        } catch (error) {
            saveLog(req.session.user.username, `❌ Error fetching flight for ${req.session.user.email}.`);
            console.error('❌ Error fetching flight:', error);
            res.status(500).json({ error: 'Failed to fetch flight' });
        }
    }
};

module.exports = adminController;