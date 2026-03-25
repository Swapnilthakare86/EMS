const db = require("../config/db");

// CREATE
exports.createDepartment = async (data) => {
  const sql = `
    INSERT INTO department (company_id, department_name)
    VALUES (?, ?)
  `;

  const [result] = await db.execute(sql, [
    data.company_id,
    data.department_name
  ]);

  return result;
};

// GET ALL
exports.getAllDepartments = async () => {
  const [rows] = await db.execute("SELECT * FROM department");
  return rows;
};

// GET BY ID
exports.getDepartmentById = async (id) => {
  const [rows] = await db.execute(
    "SELECT * FROM department WHERE department_id = ?",
    [id]
  );
  return rows;
};

// UPDATE
exports.updateDepartment = async (id, data) => {
  const sql = `
    UPDATE department
    SET company_id = ?, department_name = ?
    WHERE department_id = ?
  `;

  const [result] = await db.execute(sql, [
    data.company_id,
    data.department_name,
    id
  ]);

  return result;
};

// DELETE
exports.deleteDepartment = async (id) => {
  const [result] = await db.execute(
    "DELETE FROM department WHERE department_id = ?",
    [id]
  );

  return result;
};