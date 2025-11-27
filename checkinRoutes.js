// routes/checkinRoutes.js
const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkinController');

router.get('/checkin', checkinController.showCheckInPage);
router.post('/checkin', checkinController.processCheckIn);

module.exports = router;