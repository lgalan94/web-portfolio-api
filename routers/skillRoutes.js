const express = require('express');
const skillsController = require('../controllers/skillController');

const auth = require('../auth.js'); 

const router = express.Router();

router.get('/', skillsController.RetrieveSkills);
router.get('/list', skillsController.GetSkills);

router.post('/add', auth.verify, skillsController.AddSkill);

router.delete('/:id', auth.verify, auth.adminOnly, skillsController.DeleteSkill);

module.exports = router;