const express = require('express');
const employmentController = require('../controllers/employmentController');

const router = express.Router();

router.post('/create', employmentController.Create);
router.get('/', employmentController.GetAll);
router.get('/:id', employmentController.GetOne);
router.put('/update/:id', employmentController.Update);
router.delete('/delete/:id', employmentController.Delete);

module.exports = router;
