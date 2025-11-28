const express = require('express');
const router = express.Router();
const authController = require('../controllers/loginController');

// Show login form
router.get('/login', authController.showLoginForm);

// Handle login form submission
router.post('/login', authController.login);

// Show registration form
router.get('/register', authController.showRegisterForm );

// Handle registration form submission
router.post('/register', authController.register);

router.get('/logout', authController.logout);

router.get('/change-password', authController.showChangePasswordForm);
router.post('/change-password', authController.changePassword);

router.get('/edit-profile', authController.showEditProfileForm);
router.post('/edit-profile', authController.updateProfile);

module.exports = router;