const express = require('express');
const router = express.Router();
// Assuming you saved the controller above as authController.js
const authController = require('../controllers/userController'); 

// POST /auth/register - Initial setup
router.post('/register', authController.registerUser);

// POST /auth/login - Daily login
router.post('/login', authController.loginUser);

module.exports = router;