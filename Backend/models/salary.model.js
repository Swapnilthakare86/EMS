const db = require("../config/db");

// CREATE salary
exports.createSalary = async (data) => {
  const sql = `
    INSERT INTO salary (employee_id, basic_salary, deductions, start_date)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await db.execute(sql, [
    data.employee_id,
    data.basic_salary,
    data.deductions,
    data.start_date,
  ]);
  return result;
};

// GET all salaries (with employee info)
exports.getAllSalaries = async () => {
  const sql = `
    SELECT 
      s.salary_id,
      s.basic_salary,
      s.deductions,
      s.start_date,
      e.employee_id,
      e.employee_code,
      e.first_name,
      e.last_name
    FROM salary s
    JOIN employee e ON s.employee_id = e.employee_id
  `;
  const [rows] = await db.execute(sql);
  return rows;
};

// GET salary by ID
exports.getSalaryById = async (id) => {
  const sql = `
    SELECT 
      s.salary_id,
      s.basic_salary,
      s.deductions,
      s.start_date,
      e.employee_id,
      e.employee_code,
      e.first_name,
      e.last_name
    FROM salary s
    JOIN employee e ON s.employee_id = e.employee_id
    WHERE s.salary_id = ?
  `;
  const [rows] = await db.execute(sql, [id]);
  return rows;
};

// UPDATE salary
exports.updateSalary = async (id, data) => {
  const sql = `
    UPDATE salary 
    SET basic_salary = ?, deductions = ?, start_date = ?
    WHERE salary_id = ?
  `;
  const [result] = await db.execute(sql, [
    data.basic_salary,
    data.deductions,
    data.start_date,
    id, // correct parameter here
  ]);
  return result;
};

// DELETE salary
exports.deleteSalary = async (id) => {
  const [result] = await db.execute(
    "DELETE FROM salary WHERE salary_id = ?",
    [id]
  );
  return result;
};

// GET salary by employee ID
exports.getSalaryByEmployeeId = async (employeeId) => {
  const sql = `
    SELECT 
      s.salary_id,
      s.basic_salary,
      s.deductions,
      s.start_date,
      e.employee_id,
      e.employee_code,
      e.first_name,
      e.last_name
    FROM salary s
    JOIN employee e ON s.employee_id = e.employee_id
    WHERE e.employee_id = ?
  `;
  const [rows] = await db.execute(sql, [employeeId]);
  return rows;
};