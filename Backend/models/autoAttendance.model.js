const db = require("../config/db");

exports.markLogin = async (employeeId) => {

  const today = new Date().toISOString().slice(0,10);
  const now = new Date().toTimeString().slice(0,8);

  const [rows] = await db.execute(
    "SELECT * FROM attendance WHERE employee_id=? AND attendance_date=?",
    [employeeId, today]
  );

  if(rows.length){
    return rows[0];
  }

  const sql = `
  INSERT INTO attendance
  (employee_id, attendance_date, check_in, attendance_status_id, remarks)
  VALUES (?, ?, ?, 1, 'System Checkin')
  `;

  const [result] = await db.execute(sql,[employeeId,today,now]);

  return result;
};


exports.markLogout = async (employeeId) => {

  const today = new Date().toISOString().slice(0,10);
  const now = new Date().toTimeString().slice(0,8);

  const [rows] = await db.execute(
    "SELECT * FROM attendance WHERE employee_id=? AND attendance_date=?",
    [employeeId,today]
  );

  if(!rows.length){
    return null;
  }

  const attendance = rows[0];

  await db.execute(
    "UPDATE attendance SET check_out=? WHERE attendance_id=?",
    [now,attendance.attendance_id]
  );

  return attendance;
};