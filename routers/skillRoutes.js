const express = require('express');
const skillsController = require('../controllers/skillController');
// 💡 Import the authentication middleware from your auth.js
const auth = require('../auth.js'); 

const router = express.Router();

// GET /api/skills - PUBLIC ROUTE (To display skills on the portfolio front-end)
router.get('/', skillsController.RetrieveSkills);

// POST /api/skills/add - SECURED ROUTE (Only admin can add)
router.post('/add', auth.verify, skillsController.AddSkill);

// DELETE /api/skills/:id - SECURED ROUTE (Only admin can delete)
router.delete('/:id', auth.verify, skillsController.DeleteSkill);

module.exports = router;