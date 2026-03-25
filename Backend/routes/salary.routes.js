const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salary.controller");
const { verifyToken } = require("../middleware/auth");

router.post("/", verifyToken, salaryController.createSalary);
router.put("/:id", verifyToken, salaryController.updateSalary);

router.get("/", verifyToken, salaryController.getAllSalaries);
router.get("/:id", verifyToken, salaryController.getSalaryById);
router.delete("/:id", verifyToken, salaryController.deleteSalary);

module.exports = router;