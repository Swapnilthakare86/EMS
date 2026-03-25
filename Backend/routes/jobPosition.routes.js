const express = require("express");
const router = express.Router();
const jobPositionController = require("../controllers/jobPosition.controller");
const { verifyToken } = require("../middleware/auth");

const {
  createJobPositionValidation,
  updateJobPositionValidation
} = require("../middleware/validation/jobPosition.validation");

const { validate } = require("../middleware/validate");

router.post("/", verifyToken, createJobPositionValidation, validate, jobPositionController.createJobPosition);
router.put("/:id", verifyToken, updateJobPositionValidation, validate, jobPositionController.updateJobPosition);

router.get("/", verifyToken, jobPositionController.getAllJobPositions);
router.get("/:id", verifyToken, jobPositionController.getJobPositionById);
router.delete("/:id", verifyToken, jobPositionController.deleteJobPosition);

module.exports = router;