const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/department.controller");
const { verifyToken } = require("../middleware/auth");

const {createDepartmentValidation,updateDepartmentValidation} = require("../middleware/validation/department.validation");

const { validate } = require("../middleware/validate");

router.post("/", verifyToken, createDepartmentValidation, validate, departmentController.createDepartment);
router.put("/:id", verifyToken, updateDepartmentValidation, validate, departmentController.updateDepartment);

router.get("/", verifyToken, departmentController.getAllDepartments);
router.get("/:id", verifyToken, departmentController.getDepartmentById);
router.delete("/:id", verifyToken, departmentController.deleteDepartment);

module.exports = router;