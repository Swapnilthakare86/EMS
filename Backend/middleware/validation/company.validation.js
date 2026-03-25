const { body, param } = require("express-validator");
const db = require("../../config/db");

//CREATE COMPANY VALIDATION

exports.createCompanyValidation = [
  body("company_name")
    .notEmpty().withMessage("Company name is required")
    .isString().withMessage("Company name must be a string"),

  body("registration_number")
    .notEmpty().withMessage("Registration number is required")
    .isString().withMessage("Registration number must be a string")
    .custom(async (registration_number) => {
      const [rows] = await db.execute(
        "SELECT company_id FROM company WHERE registration_number = ?",
        [registration_number]
      );
      if (rows.length > 0) {
        throw new Error("Registration number already exists");
      }
      return true;
    }),

  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format")
    .custom(async (email) => {
      const [rows] = await db.execute(
        "SELECT company_id FROM company WHERE email = ?",
        [email]
      );
      if (rows.length > 0) {
        throw new Error("Company email already exists");
      }
      return true;
    }),

  body("phone")
    .notEmpty().withMessage("Phone is required")
    .isString().withMessage("Phone must be a string"),

  body("created_at")
    .notEmpty().withMessage("Created date is required")
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("created_at must be YYYY-MM-DD")
];


//  UPDATE COMPANY VALIDATION 

exports.updateCompanyValidation = [
  param("id")
    .isInt().withMessage("Company ID must be an integer")
    .custom(async (id) => {
      const [rows] = await db.execute(
        "SELECT company_id FROM company WHERE company_id = ?",
        [id]
      );
      if (!rows.length) {
        throw new Error("Company not found");
      }
      return true;
    }),

  body("company_name")
    .optional()
    .isString().withMessage("Company name must be a string"),

  body("registration_number")
    .optional()
    .isString().withMessage("Registration number must be a string")
    .custom(async (registration_number, { req }) => {
      const companyId = req.params.id;

      const [rows] = await db.execute(
        "SELECT company_id FROM company WHERE registration_number = ? AND company_id != ?",
        [registration_number, companyId]
      );

      if (rows.length > 0) {
        throw new Error("Registration number already exists");
      }
      return true;
    }),

  body("email")
    .optional()
    .isEmail().withMessage("Invalid email format")
    .custom(async (email, { req }) => {
      const companyId = req.params.id;

      const [rows] = await db.execute(
        "SELECT company_id FROM company WHERE email = ? AND company_id != ?",
        [email, companyId]
      );

      if (rows.length > 0) {
        throw new Error("Company email already exists");
      }
      return true;
    }),

  body("phone")
    .optional()
    .isString().withMessage("Phone must be a string"),

  body("created_at")
    .optional()
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("created_at must be YYYY-MM-DD")
];