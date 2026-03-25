const db = require("../config/db");


// ================= CREATE LEAVE =================
exports.createLeaveRequest = async (data) => {

  const sql = `
    INSERT INTO leave_request
    (
      employee_id,
      leave_type_id,
      start_date,
      end_date,
      total_days,
      reason,
      status_id,
      applied_on,
      approved_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.execute(sql, [
    data.employee_id,
    data.leave_type_id,
    data.start_date,
    data.end_date,
    data.total_days,
    data.reason,
    data.status_id,
    data.applied_on,
    data.approved_by || null
  ]);

  return result;
};



// ================= GET ALL LEAVES =================
exports.getAllLeaveRequests = async () => {

  const [rows] = await db.execute(`
    SELECT 
      leave_request_id,
      employee_id,
      leave_type_id,
      DATE_FORMAT(start_date,'%Y-%m-%d') AS start_date,
      DATE_FORMAT(end_date,'%Y-%m-%d') AS end_date,
      total_days,
      reason,
      status_id,
      DATE_FORMAT(applied_on,'%Y-%m-%d') AS applied_on,
      approved_by
    FROM leave_request
    ORDER BY leave_request_id DESC
  `);

  return rows;
};



// ================= GET LEAVE BY ID =================
exports.getLeaveRequestById = async (id) => {

  const [rows] = await db.execute(`
    SELECT 
      leave_request_id,
      employee_id,
      leave_type_id,
      DATE_FORMAT(start_date,'%Y-%m-%d') AS start_date,
      DATE_FORMAT(end_date,'%Y-%m-%d') AS end_date,
      total_days,
      reason,
      status_id,
      DATE_FORMAT(applied_on,'%Y-%m-%d') AS applied_on,
      approved_by
    FROM leave_request
    WHERE leave_request_id = ?
  `,[id]);

  return rows;
};



// ================= UPDATE FULL LEAVE =================
exports.updateLeaveRequest = async (id,data) => {

  const sql = `
    UPDATE leave_request
    SET
      employee_id = ?,
      leave_type_id = ?,
      start_date = ?,
      end_date = ?,
      total_days = ?,
      reason = ?,
      status_id = ?,
      applied_on = ?,
      approved_by = ?
    WHERE leave_request_id = ?
  `;

  const [result] = await db.execute(sql,[
    data.employee_id,
    data.leave_type_id,
    data.start_date,
    data.end_date,
    data.total_days,
    data.reason,
    data.status_id,
    data.applied_on,
    data.approved_by || null,
    id
  ]);

  return result;
};



// ================= UPDATE STATUS (MANAGER APPROVAL) =================
exports.updateLeaveStatus = async (id,data) => {

  const sql = `
    UPDATE leave_request
    SET
      status_id = ?,
      approved_by = ?
    WHERE leave_request_id = ?
  `;

  const [result] = await db.execute(sql,[
    data.status_id,
    data.approved_by,
    id
  ]);

  return result;
};



// ================= DELETE LEAVE =================
exports.deleteLeaveRequest = async (id) => {

  const [result] = await db.execute(
    `DELETE FROM leave_request WHERE leave_request_id = ?`,
    [id]
  );

  return result;
};



// ================= GET LEAVE BY EMPLOYEE =================
exports.getLeaveRequestsByEmployeeId = async (empId) => {

  const [rows] = await db.execute(`
    SELECT 
      leave_request_id,
      employee_id,
      leave_type_id,
      DATE_FORMAT(start_date,'%Y-%m-%d') AS start_date,
      DATE_FORMAT(end_date,'%Y-%m-%d') AS end_date,
      total_days,
      reason,
      status_id,
      DATE_FORMAT(applied_on,'%Y-%m-%d') AS applied_on,
      approved_by
    FROM leave_request
    WHERE employee_id = ?
    ORDER BY leave_request_id DESC
  `,[empId]);

  return rows;
};