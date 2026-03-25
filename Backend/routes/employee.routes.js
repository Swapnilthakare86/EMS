const express = require("express");
const router = express.Router();

const employeeController = require("../controllers/employee.controller");

const {
  createEmployeeValidation,
  updateEmployeeValidation
} = require("../middleware/validation/employee.validation");

const { validate } = require("../middleware/validate");
const { verifyToken } = require("../middleware/auth");

router.get("/check-email", employeeController.checkEmail);
// Next employee code
router.get("/next-code", employeeController.getNextEmployeeCode);

// Get employee by employee_code
router.get("/code/:code", employeeController.getEmployeeByCode);

// GET managers for reporting manager dropdown
router.get("/managers", employeeController.getManagers);

// CRUD
router.post("/", verifyToken, createEmployeeValidation, validate, employeeController.createEmployee);

router.patch("/:id/manager", verifyToken, employeeController.updateReportingManager);

router.put("/:id", verifyToken, updateEmployeeValidation, validate, employeeController.updateEmployee);

router.get("/", verifyToken, employeeController.getAllEmployees);

router.get("/:id", verifyToken, employeeController.getEmployeeById);

router.delete("/:id", verifyToken, employeeController.deleteEmployee);


module.exports = router;