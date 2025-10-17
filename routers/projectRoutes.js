const express = require('express');
const projectController = require('../controllers/projectController');
// 💡 Import the authentication middleware from your custom auth file
const auth = require('../auth.js'); 
const router = express.Router();
const upload = require('../config/multer');

// ------------------------------------------------------------------
// PUBLIC READ ROUTES (Portfolio Display)
// ------------------------------------------------------------------
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);


// ------------------------------------------------------------------
// SECURED ADMIN ROUTES (CMS Management)
// ------------------------------------------------------------------

router.post(
  '/create',
  auth.verify,
  upload.single('image'), // handle single image file
  projectController.createProject
);

// PUT /projects/:id - SECURED (Only admin can update)
router.put('/:id', auth.verify, projectController.updateProject);

// DELETE /projects/:id - SECURED (Only admin can delete)
router.delete('/:id', auth.verify, projectController.deleteProject);

module.exports = router;