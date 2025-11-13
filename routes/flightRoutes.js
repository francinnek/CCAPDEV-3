const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');

router.get('/', flightController.getAllFlights);

router.get('/create', flightController.showCreateForm);
router.post('/create', flightController.createFlight);

router.get('/:id/edit', flightController.showEditForm);
router.post('/:id/edit', flightController.updateFlight);

router.delete('/:id', flightController.deleteFlight);

module.exports = router;
