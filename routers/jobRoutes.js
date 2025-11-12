const express = require('express');
const jobController = require('../controllers/jobController');

const router = express.Router();

router.get("/", jobController.getJobs);
router.get("/:id", jobController.getJobById);
router.post("/", jobController.createJob);
router.put("/:id", jobController.updateJob);
router.delete("/:id", jobController.deleteJob);

module.exports = router;
