const multer = require('multer');

// Use memory storage instead of saving files locally
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit to 5MB
});

module.exports = upload;
