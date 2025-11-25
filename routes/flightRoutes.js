const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');
const userRoleAuth = require('../userAuth-middleware/userRoleAuth');

router.get('/', userRoleAuth('admin'), flightController.getAllFlights);
// router.get('/', userRoleAuth('user'), flightController.getAllFlights);

router.get('/create', userRoleAuth('admin'),flightController.showCreateForm);
// router.get('/create', userRoleAuth('user'),flightController.showCreateForm);

router.post('/create', userRoleAuth('admin'),flightController.createFlight);
// router.post('/create', userRoleAuth('user'),flightController.createFlight);

router.get('/:id/edit', userRoleAuth('admin'),flightController.showEditForm);
// router.get('/:id/edit', userRoleAuth('user'),flightController.showEditForm);

router.post('/:id/edit', userRoleAuth('admin'),flightController.updateFlight);
// router.post('/:id/edit', userRoleAuth('user'),flightController.updateFlight);

router.delete('/:id', userRoleAuth('admin'), flightController.deleteFlight);

module.exports = router;
