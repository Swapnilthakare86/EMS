const express = require("express");
const router = express.Router();
const locationController = require("../controllers/location.controller");
const { verifyToken } = require("../middleware/auth");

const {createLocationValidation,updateLocationValidation} = require("../middleware/validation/location.validation");

const { validate } = require("../middleware/validate");

// CREATE
router.post("/", verifyToken, createLocationValidation, validate, locationController.createLocation);

// UPDATE
router.put("/:id", verifyToken, updateLocationValidation, validate, locationController.updateLocation);

//  GET locations by company ID 
router.get("/company/:company_id", verifyToken, locationController.getLocationsByCompanyId);

// READ ALL
router.get("/", verifyToken, locationController.getAllLocations);

// READ BY ID
router.get("/:id", verifyToken, locationController.getLocationById);

// DELETE
router.delete("/:id", verifyToken, locationController.deleteLocation);

module.exports = router;