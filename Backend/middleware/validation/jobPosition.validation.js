const { body, param } = require("express-validator");
const db = require("../../config/db");

//  CREATE JOB POSITION

exports.createJobPositionValidation = [
  body("department_id")
    .notEmpty().withMessage("Department ID is required")
    .isInt().withMessage("Department ID must be an integer")
    .custom(async (department_id) => {
      const [rows] = await db.execute(
        "SELECT department_id FROM department WHERE department_id = ?",
        [department_id]
      );
      if (!rows.length) {
        throw new Error("Department does not exist");
      }
      return true;
    }),

  body("position_title")
    .notEmpty().withMessage("Position title is required")
    .isString().withMessage("Position title must be a string")
    .custom(async (position_title, { req }) => {
      const [rows] = await db.execute(
        "SELECT job_position_id FROM job_position WHERE department_id = ? AND position_title = ?",
        [req.body.department_id, position_title]
      );

      if (rows.length > 0) {
        throw new Error("Position already exists in this department");
      }
      return true;
    })
];


//  UPDATE JOB POSITION 

exports.updateJobPositionValidation = [
  param("id")
    .isInt().withMessage("Job position ID must be an integer")
    .custom(async (id) => {
      const [rows] = await db.execute(
        "SELECT job_position_id FROM job_position WHERE job_position_id = ?",
        [id]
      );
      if (!rows.length) {
        throw new Error("Job position not found");
      }
      return true;
    }),

  body("department_id")
    .optional()
    .isInt().withMessage("Department ID must be an integer")
    .custom(async (department_id) => {
      const [rows] = await db.execute(
        "SELECT department_id FROM department WHERE department_id = ?",
        [department_id]
      );
      if (!rows.length) {
        throw new Error("Department does not exist");
      }
      return true;
    }),

  body("position_title")
    .optional()
    .isString().withMessage("Position title must be a string")
    .custom(async (position_title, { req }) => {
      const jobPositionId = req.params.id;
      const departmentId = req.body.department_id;

      const [rows] = await db.execute(
        `SELECT job_position_id 
         FROM job_position 
         WHERE department_id = ? 
           AND position_title = ? 
           AND job_position_id != ?`,
        [departmentId, position_title, jobPositionId]
      );

      if (rows.length > 0) {
        throw new Error("Position already exists in this department");
      }
      return true;
    })
];