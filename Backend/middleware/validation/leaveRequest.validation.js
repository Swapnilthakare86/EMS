const { body, param } = require("express-validator");
const db = require("../../config/db");

//  CREATE LEAVE REQUEST 

exports.createLeaveRequestValidation = [
  body("employee_id")
    .notEmpty().withMessage("Employee ID is required")
    .isInt().withMessage("Employee ID must be integer")
    .custom(async (employee_id) => {
      const [rows] = await db.execute(
        "SELECT employee_id FROM employee WHERE employee_id = ?",
        [employee_id]
      );
      if (!rows.length) {
        throw new Error("Employee does not exist");
      }
      return true;
    }),

  body("leave_type_id")
    .notEmpty().withMessage("Leave type ID is required")
    .isInt().withMessage("Leave type ID must be integer")
    .custom(async (leave_type_id) => {
      const [rows] = await db.execute(
        "SELECT master_data_id FROM master_data WHERE master_data_id = ?",
        [leave_type_id]
      );
      if (!rows.length) {
        throw new Error("Leave type not found");
      }
      return true;
    }),

  body("start_date")
    .notEmpty().withMessage("Start date is required")
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("Start date must be YYYY-MM-DD"),

  body("end_date")
    .notEmpty().withMessage("End date is required")
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("End date must be YYYY-MM-DD")
    .custom((end_date, { req }) => {
      if (new Date(end_date) < new Date(req.body.start_date)) {
        throw new Error("End date cannot be before start date");
      }
      return true;
    }),

  body("total_days")
    .notEmpty().withMessage("Total days is required")
    .isInt({ min: 1 }).withMessage("Total days must be positive number"),

  body("reason")
    .optional()
    .isString().withMessage("Reason must be string"),

  body("status_id")
    .notEmpty().withMessage("Status ID is required")
    .isInt().withMessage("Status ID must be integer"),

  body("applied_on")
    .notEmpty().withMessage("Applied date is required")
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("Applied date must be YYYY-MM-DD"),

  body("approved_by")
    .optional()
];


//  UPDATE LEAVE REQUEST 

exports.updateLeaveRequestValidation = [
  param("id")
    .isInt().withMessage("Leave request ID must be integer")
    .custom(async (id) => {
      const [rows] = await db.execute(
        "SELECT leave_request_id FROM leave_request WHERE leave_request_id = ?",
        [id]
      );
      if (!rows.length) {
        throw new Error("Leave request not found");
      }
      return true;
    }),

  body("employee_id")
    .optional()
    .isInt().withMessage("Employee ID must be integer"),

  body("leave_type_id")
    .optional()
    .isInt().withMessage("Leave type ID must be integer"),

  body("start_date")
    .optional()
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("Start date must be YYYY-MM-DD"),

  body("end_date")
    .optional()
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("End date must be YYYY-MM-DD")
    .custom((end_date, { req }) => {
      if (req.body.start_date && new Date(end_date) < new Date(req.body.start_date)) {
        throw new Error("End date cannot be before start date");
      }
      return true;
    }),

  body("total_days")
    .optional()
    .isInt({ min: 1 }).withMessage("Total days must be positive number"),

  body("reason")
    .optional()
    .isString().withMessage("Reason must be string"),

  body("status_id")
    .optional()
    .isInt().withMessage("Status ID must be integer"),

  body("applied_on")
    .optional()
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("Applied date must be YYYY-MM-DD"),

  body("approved_by")
    .optional()
];