const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company.controller");
const { verifyToken } = require("../middleware/auth");

const {createCompanyValidation,updateCompanyValidation} = require("../middleware/validation/company.validation");

const { validate } = require("../middleware/validate");

router.post("/",verifyToken, createCompanyValidation, validate, companyController.createCompany);
router.put("/:id", verifyToken, updateCompanyValidation, validate, companyController.updateCompany);

router.get("/", verifyToken, companyController.getAllCompanies);
router.get("/:id", verifyToken, companyController.getCompanyById);
router.delete("/:id", verifyToken, companyController.deleteCompany);

module.exports = router;