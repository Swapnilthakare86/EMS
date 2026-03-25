const { body, param } = require("express-validator");
const db = require("../../config/db");

//  CREATE DEPARTMENT

exports.createDepartmentValidation = [
  body("company_id")
    .notEmpty().withMessage("Company ID is required")
    .isInt().withMessage("Company ID must be an integer")
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

  body("department_name")
    .notEmpty().withMessage("Department name is required")
    .isString().withMessage("Department name must be a string")
    .custom(async (department_name, { req }) => {
      const [rows] = await db.execute(
        "SELECT department_id FROM department WHERE company_id = ? AND department_name = ?",
        [req.body.company_id, department_name]
      );

      if (rows.length > 0) {
        throw new Error("Department already exists for this company");
      }
      return true;
    })
];


// UPDATE DEPARTMENT

exports.updateDepartmentValidation = [
  param("id")
    .isInt().withMessage("Department ID must be an integer")
    .custom(async (id) => {
      const [rows] = await db.execute(
        "SELECT department_id FROM department WHERE department_id = ?",
        [id]
      );
      if (!rows.length) {
        throw new Error("Department not found");
      }
      return true;
    }),

  body("company_id")
    .optional()
    .isInt().withMessage("Company ID must be an integer")
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

  body("department_name")
    .optional()
    .isString().withMessage("Department name must be a string")
    .custom(async (department_name, { req }) => {
      const departmentId = req.params.id;
      const companyId = req.body.company_id;

      const [rows] = await db.execute(
        "SELECT department_id FROM department WHERE company_id = ? AND department_name = ? AND department_id != ?",
        [companyId, department_name, departmentId]
      );

      if (rows.length > 0) {
        throw new Error("Department already exists for this company");
      }
      return true;
    })
];