const Department = require("../models/department.model");

exports.createDepartment = async (req, res, next) => {
  try {
    const result = await Department.createDepartment(req.body);
    res.status(201).json({
      message: "Department created",
      id: result.insertId
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllDepartments = async (req, res, next) => {
  try {
    const rows = await Department.getAllDepartments();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getDepartmentById = async (req, res, next) => {
  try {
    const rows = await Department.getDepartmentById(req.params.id);

    if (!rows.length) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const result = await Department.updateDepartment(
      req.params.id,
      req.body
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json({ message: "Department updated successfully" });
  } catch (err) {
    next(err);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const result = await Department.deleteDepartment(req.params.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    next(err);
  }
};