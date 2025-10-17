const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
// 💡 Import the authentication middleware from your custom auth file
const auth = require('../auth.js'); 

// ------------------------------------------------------------------
// 1. PUBLIC ROUTE: Contact Form Submission
// POST /messages/send - Anyone can hit this.
router.post('/send', messageController.sendMessage);

// ------------------------------------------------------------------
// 2. SECURED ROUTES: CMS Inbox Operations (Requires Admin Login)

// GET /messages (Read All) is secured
router.route('/')
    .get(auth.verify, messageController.getAllMessages); // 🔒 SECURED

// GET /messages/:id and DELETE /messages/:id are secured
router.route('/:id')
    .get(auth.verify, messageController.getMessageById) // 🔒 SECURED
    .delete(auth.verify, messageController.deleteMessage); // 🔒 SECURED

// PUT /messages/:id/status (Update status to read/archive/delete) is secured
router.put('/:id/status', auth.verify, messageController.updateMessageStatus); // 🔒 SECURED

module.exports = router;