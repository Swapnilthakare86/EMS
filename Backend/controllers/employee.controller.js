const Employee = require("../models/employee.model");
const db = require("../config/db"); 

// CREATE EMPLOYEE
exports.createEmployee = async (req, res, next) => {
  try {

    const employee = await Employee.createEmployee(req.body);

    res.status(201).json(employee);

  } catch (err) {

    if (err.code === "ER_DUP_ENTRY") {

      return res.status(400).json({
        errors: {
          email: { msg: "Email already exists" }
        }
      });

    }

    next(err);
  }
};


// GET ALL EMPLOYEES
exports.getAllEmployees = async (req, res, next) => {
  try {

    const rows = await Employee.getAllEmployees();

    res.status(200).json({
      count: rows.length,
      data: rows
    });

  } catch (err) {
    next(err);
  }
};

exports.checkEmail = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.json({ exists: false });
    }

    const [rows] = await db.execute(
      "SELECT email FROM employee WHERE LOWER(email) = LOWER(?)",
      [email]
    );

    res.json({ exists: rows.length > 0 });

  } catch (err) {
    next(err);
  }
};

// GET EMPLOYEE BY ID
exports.getEmployeeById = async (req, res, next) => {

  try {

    const { id } = req.params;

    const rows = await Employee.getEmployeeById(id);

    if (!rows.length) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.json(rows[0]);

  } catch (err) {
    next(err);
  }

};


// GET EMPLOYEE BY CODE
exports.getEmployeeByCode = async (req, res, next) => {

  try {

    const { code } = req.params;

    const employee = await Employee.getEmployeeByCode(code);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.json(employee);

  } catch (err) {
    next(err);
  }

};


// UPDATE EMPLOYEE
exports.updateEmployee = async (req, res, next) => {

  try {

    const { id } = req.params;

    const rows = await Employee.getEmployeeById(id);

    if (!rows.length) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    await Employee.updateEmployee(id, req.body);

    res.json({
      message: "Employee updated successfully"
    });

  } catch (err) {
    next(err);
  }

};


// DELETE EMPLOYEE
exports.deleteEmployee = async (req, res, next) => {

  try {

    const { id } = req.params;

    const rows = await Employee.getEmployeeById(id);

    if (!rows.length) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    await Employee.deleteEmployee(id);

    res.json({
      message: "Employee deleted successfully"
    });

  } catch (err) {
    next(err);
  }

};


// GET NEXT EMPLOYEE CODE
exports.getNextEmployeeCode = async (req, res, next) => {

  try {

    const lastEmployee = await Employee.getLastEmployeeCode();

    let nextCode = "EMP001";

    if (lastEmployee) {

      const lastNumber = parseInt(
        lastEmployee.employee_code.replace("EMP", ""),
        10
      );

      nextCode =
        "EMP" +
        (lastNumber + 1)
          .toString()
          .padStart(3, "0");

    }

    res.json({ nextCode });

  } catch (err) {
    next(err);
  }

};


// UPDATE REPORTING MANAGER ONLY
exports.updateReportingManager = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reporting_manager_id } = req.body;
    await Employee.updateReportingManager(id, reporting_manager_id);
    res.json({ message: "Reporting manager updated" });
  } catch (err) {
    next(err);
  }
};

// GET MANAGERS
exports.getManagers = async (req, res, next) => {

  try {

    const rows = await Employee.getManagers();

    res.status(200).json({
      count: rows.length,
      data: rows
    });

  } catch (err) {

    next(err);

  }

};