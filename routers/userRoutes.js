const express = require('express');
const router = express.Router();
const auth = require('../auth.js'); 
const authController = require('../controllers/userController');
const multer = require('multer');

// Use memory storage for Cloudinary uploads
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', authController.registerUser);    
router.post('/login', authController.loginUser);          
router.get('/profile/:id', authController.getPublicUserProfile);

router.route('/profile')
    .get(auth.verify, authController.getUserProfile)
    .put(auth.verify, auth.adminOnly, upload.single('profilePicture'), authController.updateUserProfile);

module.exports = router;
