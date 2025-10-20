const express = require('express');
const projectController = require('../controllers/projectController');
// 💡 Import the authentication middleware from your custom auth file
const auth = require('../auth.js'); 
const router = express.Router();
const upload = require('../config/multer');

router.post(
  '/create',
  auth.verify,
  auth.adminOnly,
  upload.single('image'), // handle single image file
  projectController.createProject
);
router.get('/', projectController.getAllProjects);
router.get('/:id', auth.verify, projectController.getProjectById);
router.put(
  '/:id',
  auth.verify,
  auth.adminOnly,
  upload.single('image'), 
  projectController.updateProject
);
router.delete('/:id', auth.verify, projectController.deleteProject);

module.exports = router;