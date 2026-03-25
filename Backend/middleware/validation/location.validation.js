const { body, param } = require("express-validator");
const db = require("../../config/db");

// CREATE LOCATION 

exports.createLocationValidation = [
  body("company_id")
    .notEmpty().withMessage("Company ID is required")
    .isInt().withMessage("Company ID must be integer")
    .custom(async (company_id) => {
      const [rows] = await db.execute(
        "SELECT company_id FROM company WHERE company_id = ?",
        [company_id]
      );
      if (!rows.length) {
        throw new Error("Company does not exist");
      }
      return true;
    }),

  body("location_name")
    .notEmpty().withMessage("Location name is required")
    .isString().withMessage("Location name must be string"),

  body("address")
    .notEmpty().withMessage("Address is required")
    .isString().withMessage("Address must be string"),

  body("city")
    .notEmpty().withMessage("City is required")
    .isString().withMessage("City must be string"),

  body("state")
    .notEmpty().withMessage("State is required")
    .isString().withMessage("State must be string"),

  body("country")
    .notEmpty().withMessage("Country is required")
    .isString().withMessage("Country must be string"),
];


// UPDATE LOCATION 

exports.updateLocationValidation = [
  param("id")
    .isInt().withMessage("Location ID must be integer")
    .custom(async (id) => {
      const [rows] = await db.execute(
        "SELECT location_id FROM location WHERE location_id = ?",
        [id]
      );
      if (!rows.length) {
        throw new Error("Location not found");
      }
      return true;
    }),

  body("company_id")
    .optional()
    .isInt().withMessage("Company ID must be integer")
    .custom(async (company_id) => {
      const [rows] = await db.execute(
        "SELECT company_id FROM company WHERE company_id = ?",
        [company_id]
      );
      if (!rows.length) {
        throw new Error("Company does not exist");
      }
      return true;
    }),

  body("location_name")
    .optional()
    .isString().withMessage("Location name must be string"),

  body("address")
    .optional()
    .isString().withMessage("Address must be string"),

  body("city")
    .optional()
    .isString().withMessage("City must be string"),

  body("state")
    .optional()
    .isString().withMessage("State must be string"),

  body("country")
    .optional()
    .isString().withMessage("Country must be string"),
];