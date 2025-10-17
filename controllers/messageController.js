const Message = require('../models/Message'); // Import the Message Model

// =======================================================
// C - CREATE a New Message (POST /api/messages/send or /api/contact)
// This is typically from a contact form on the public-facing portfolio
// =======================================================
exports.sendMessage = async (req, res) => {
  try {
    const { senderName, senderEmail, subject, messageBody } = req.body;

    // Basic validation
    if (!senderName || !senderEmail || !subject || !messageBody) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newMessage = new Message({
      senderName,
      senderEmail,
      subject,
      messageBody,
      status: 'unread', // New messages are always unread
    });

    const message = await newMessage.save();

    res.status(201).json({
      message: 'Message sent successfully! Thank you for contacting.',
      message: message,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to send message.',
      error: error.message,
    });
  }
};

// =======================================================
// R - READ All Messages (GET /api/messages)
// (For the CMS inbox view)
// =======================================================
exports.getAllMessages = async (req, res) => {
  try {
    // You might want to filter by status (e.g., only 'unread' or 'read')
    // or sort by receivedAt descending to show newest first.
    const messages = await Message.find().sort({ receivedAt: -1 });

    res.status(200).json({
      message: 'Messages retrieved successfully.',
      count: messages.length,
      messages: messages,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve messages.',
      error: error.message,
    });
  }
};

// =======================================================
// R - READ Single Message by ID (GET /api/messages/:id)
// (For displaying the full message content)
// =======================================================
exports.getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    // Optionally, mark as 'read' when retrieved
    if (message.status === 'unread') {
      message.status = 'read';
      await message.save();
    }

    res.status(200).json({
      message: 'Message retrieved successfully.',
      message: message,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve message.',
      error: error.message,
    });
  }
};

// =======================================================
// U - UPDATE Message Status (PUT /api/messages/:id/status)
// (e.g., mark as read, archive, unread)
// =======================================================
exports.updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body; // Expecting status like 'read', 'archived', 'deleted'

    if (!status || !['read', 'archived', 'deleted', 'unread'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found for update.' });
    }

    res.status(200).json({
      message: `Message status updated to '${status}'.`,
      message: message,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update message status.',
      error: error.message,
    });
  }
};


// =======================================================
// D - DELETE Message (DELETE /api/messages/:id)
// =======================================================
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found for deletion.' });
    }

    res.status(200).json({
      message: 'Message deleted successfully! 🗑️',
      messageId: req.params.id,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete message.',
      error: error.message,
    });
  }
};