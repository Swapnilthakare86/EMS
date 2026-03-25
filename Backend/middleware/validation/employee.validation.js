const { body } = require("express-validator");
const db = require("../../config/db"); // mysql2/promise

//  CREATE VALIDATION 

exports.createEmployeeValidation = [
  body("employee_code")
    .notEmpty().withMessage("Employee code is required")
    .isString().withMessage("Employee code must be a string"),

  body("first_name")
    .notEmpty().withMessage("First name is required")
    .isString().withMessage("First name must be a string"),

  body("last_name")
    .notEmpty().withMessage("Last name is required")
    .isString().withMessage("Last name must be a string"),

  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format")
    .custom(async (email) => {
      const [rows] = await db.execute(
        "SELECT employee_id FROM employee WHERE email = ?",
        [email]
      );

      if (rows.length > 0) {
        throw new Error("Email already exists");
      }
      return true;
    }),

  body("phone")
    .notEmpty().withMessage("Phone is required")
    .isString().withMessage("Phone must be a string"),

  body("dob")
    .notEmpty().withMessage("DOB is required")
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("DOB must be YYYY-MM-DD"),

  body("gender")
    .notEmpty().withMessage("Gender is required")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be male, female or other"),

    body("reporting_manager_id")
    .optional(),
];


// UPDATE VALIDATION 

exports.updateEmployeeValidation = [
  body("employee_code")
    .optional()
    .isString().withMessage("Employee code must be a string"),

  body("first_name")
    .optional()
    .isString().withMessage("First name must be a string"),

  body("last_name")
    .optional()
    .isString().withMessage("Last name must be a string"),

  body("email")
    .optional()
    .isEmail().withMessage("Invalid email format")
    .custom(async (email, { req }) => {
      const employeeId = req.params.id;

      const [rows] = await db.execute(
        "SELECT employee_id FROM employee WHERE email = ? AND employee_id != ?",
        [email, employeeId]
      );

      if (rows.length > 0) {
        throw new Error("Email already exists");
      }
      return true;
    }),

  body("phone")
    .optional()
    .isString().withMessage("Phone must be a string"),

  body("dob")
    .optional()
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("DOB must be YYYY-MM-DD"),

  body("gender")
    .optional()
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be male, female or other"),
];