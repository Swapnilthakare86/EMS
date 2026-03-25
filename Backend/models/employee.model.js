const db = require("../config/db");


// CREATE EMPLOYEE
exports.createEmployee = async (data) => {

  //  Normalize email
  const email = data.email.toLowerCase();

  // CHECK DUPLICATE FIRST
  const [existing] = await db.execute(
    "SELECT email FROM Employee WHERE LOWER(email) = LOWER(?)",
    [email]
  );

  if (existing.length > 0) {
    const err = new Error("Email already exists");
    err.code = "DUPLICATE_EMAIL";
    throw err;
  }

  // ================= EMP CODE =================
  const [rows] = await db.execute(
    "SELECT employee_code FROM Employee ORDER BY employee_id DESC LIMIT 1"
  );

  let newCode = "EMP001";

  if (rows.length) {
    const lastNumber = parseInt(
      rows[0].employee_code.replace("EMP", ""),
      10
    );

    newCode = "EMP" + (lastNumber + 1).toString().padStart(3, "0");
  }

  // ================= INSERT =================
  const sql = `
  INSERT INTO Employee
  (employee_code, first_name, last_name, email, phone, dob, gender,
   company_id, location_id, department_id, job_position_id,
   employment_type_id, reporting_manager_id, hire_date, role_id)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  const [result] = await db.execute(sql, [
    newCode,
    data.first_name,
    data.last_name,
    email, 
    data.phone,
    data.dob,
    data.gender,
    data.company_id,
    data.location_id,
    data.department_id,
    data.job_position_id,
    data.employment_type_id,
    data.reporting_manager_id || null,
    data.hire_date,
    data.role_id
  ]);

  const [employee] = await db.execute(
    `SELECT * FROM Employee WHERE employee_id=?`,
    [result.insertId]
  );

  return employee[0];
};



// GET EMPLOYEE BY CODE
exports.getEmployeeByCode = async (code) => {
  const sql = `
  SELECT 
    e.employee_id,
    e.employee_code,
    e.first_name,
    e.last_name,
    e.email,
    e.gender,
    e.phone,
    DATE_FORMAT(e.dob,'%Y-%m-%d') AS dob,
    DATE_FORMAT(e.hire_date,'%Y-%m-%d') AS hire_date,
    e.company_id,
    e.location_id,
    e.department_id,
    e.job_position_id,
    e.employment_type_id,
    e.reporting_manager_id,
    e.role_id,
    d.department_name,
    j.position_title,
    r.role_name,
    m.value AS employment_type
  FROM Employee e
  LEFT JOIN Department d ON e.department_id=d.department_id
  LEFT JOIN Job_Position j ON e.job_position_id=j.job_position_id
  LEFT JOIN Role r ON e.role_id=r.role_id
  LEFT JOIN master_data m ON e.employment_type_id = m.master_data_id
  WHERE e.employee_code = ?
  `;

  const [rows] = await db.execute(sql, [code]);

  return rows.length ? rows[0] : null;
};



// GET ALL EMPLOYEES
exports.getAllEmployees = async () => {

  const sql = `
  SELECT 
    e.employee_id,
    e.employee_code,
    e.first_name,
    e.last_name,
    e.email,
    e.gender,
    e.phone,
    DATE_FORMAT(e.dob,'%Y-%m-%d') AS dob,
    DATE_FORMAT(e.hire_date,'%Y-%m-%d') AS hire_date,
    e.reporting_manager_id,
    d.department_name,
    j.position_title,
    r.role_name
  FROM Employee e
  LEFT JOIN Department d ON e.department_id=d.department_id
  LEFT JOIN Job_Position j ON e.job_position_id=j.job_position_id
  LEFT JOIN Role r ON e.role_id=r.role_id
  `;

  const [rows] = await db.execute(sql);

  return rows;

};



// GET EMPLOYEE BY ID
exports.getEmployeeById = async (id) => {

  const sql = `
  SELECT
    e.employee_id,
    e.employee_code,
    e.first_name,
    e.last_name,
    e.email,
    e.gender,
    e.phone,
    DATE_FORMAT(e.dob,'%Y-%m-%d') AS dob,
    DATE_FORMAT(e.hire_date,'%Y-%m-%d') AS hire_date,
    e.company_id,
    e.location_id,
    e.department_id,
    e.job_position_id,
    e.employment_type_id,
    e.reporting_manager_id,
    e.role_id,
    d.department_name,
    j.position_title,
    r.role_name,
    m.value AS employment_type
  FROM Employee e
  LEFT JOIN Department d ON e.department_id=d.department_id
  LEFT JOIN Job_Position j ON e.job_position_id=j.job_position_id
  LEFT JOIN Role r ON e.role_id=r.role_id
  LEFT JOIN master_data m ON e.employment_type_id = m.master_data_id
  WHERE e.employee_id = ?
  `;

  const [rows] = await db.execute(sql, [id]);

  return rows;

};



// UPDATE EMPLOYEE
exports.updateEmployee = async (id,data) => {

  const sql = `
  UPDATE Employee
  SET first_name=?,
      last_name=?,
      email=?,
      phone=?,
      dob=?,
      gender=?,
      company_id=?,
      location_id=?,
      department_id=?,
      job_position_id=?,
      employment_type_id=?,
      reporting_manager_id=?,
      hire_date=?,
      role_id=?
  WHERE employee_id=?
  `;

  return db.execute(sql,[
    data.first_name,
    data.last_name,
    data.email,
    data.phone,
    data.dob,
    data.gender,
    data.company_id,
    data.location_id,
    data.department_id,
    data.job_position_id,
    data.employment_type_id,
    data.reporting_manager_id || null,
    data.hire_date,
    data.role_id,
    id
  ]);

};



// DELETE EMPLOYEE
exports.deleteEmployee = async (id) => {

  return db.execute(
    "DELETE FROM Employee WHERE employee_id=?",
    [id]
  );

};



// GET LAST EMPLOYEE CODE
exports.getLastEmployeeCode = async () => {

  const [rows] = await db.execute(
    "SELECT employee_code FROM Employee ORDER BY employee_id DESC LIMIT 1"
  );

  return rows.length ? rows[0] : null;

};

// UPDATE REPORTING MANAGER ONLY
exports.updateReportingManager = async (id, managerId) => {
  const [result] = await db.execute(
    "UPDATE Employee SET reporting_manager_id = ? WHERE employee_id = ?",
    [managerId || null, id]
  );
  return result;
};

// GET MANAGERS ONLY
exports.getManagers = async () => {

  const sql = `
  SELECT 
    e.employee_id,
    e.first_name,
    e.last_name
  FROM Employee e
  JOIN Role r ON e.role_id = r.role_id
  WHERE r.role_name = 'Manager'
  ORDER BY e.first_name
  `;

  const [rows] = await db.execute(sql);

  return rows;

};
