const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../auth.js'); 

router.post('/send', messageController.sendMessage);

router.route('/')
    .get(auth.verify, messageController.getAllMessages); 
router.route('/:id')
    .get(auth.verify, messageController.getMessageById) 
    .delete(auth.verify, messageController.deleteMessage); 

router.patch('/:id/status', auth.verify, auth.adminOnly, messageController.updateMessageStatus);

module.exports = router;