const { param } = require("express-validator");
const db = require("../../config/db");

// GET BY ID VALIDATION

exports.getMasterDataByIdValidation = [
  param("id")
    .isInt().withMessage("Master data ID must be an integer")
    .custom(async (id) => {
      const [rows] = await db.execute(
        "SELECT master_data_id FROM master_data WHERE master_data_id = ?",
        [id]
      );

      if (!rows.length) {
        throw new Error("Master data not found");
      }
      return true;
    })
];

// GET BY CATEGORY VALIDATION

exports.getByCategoryValidation = [
  param("category")
    .notEmpty().withMessage("Category is required")
    .isString().withMessage("Category must be a string")
];