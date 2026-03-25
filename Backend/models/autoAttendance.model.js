const db = require("../config/db");

// master_data IDs: 4=Present, 5=Absent, 6=On Leave, 13=Half Day
const calcStatus = (checkIn, checkOut) => {
  if (checkIn && !checkOut) return 4;
  if (!checkIn || !checkOut) return 5;
  const start = new Date(`1970-01-01T${checkIn}Z`);
  const end   = new Date(`1970-01-01T${checkOut}Z`);
  if (end <= start) return 5;
  const hours = (end - start) / (1000 * 60 * 60);
  if (hours >= 8.5) return 4;
  if (hours >= 4)   return 13;
  return 5;
};

exports.markLogin = async (employeeId) => {
  const today = new Date().toISOString().slice(0, 10);  // UTC date YYYY-MM-DD
  const now   = new Date().toISOString().slice(11, 19); // UTC time HH:MM:SS

  const [rows] = await db.execute(
    "SELECT * FROM attendance WHERE employee_id=? AND attendance_date=?",
    [employeeId, today]
  );

  if (rows.length) return rows[0];

  const [result] = await db.execute(
    `INSERT INTO attendance
     (employee_id, attendance_date, check_in, attendance_status_id, remarks)
     VALUES (?, ?, ?, ?, 'System Checkin')`,
    [employeeId, today, now, 4]
  );

  return result;
};


exports.markLogout = async (employeeId) => {
  const today = new Date().toISOString().slice(0, 10);  // UTC date
  const now   = new Date().toISOString().slice(11, 19); // UTC time

  const [rows] = await db.execute(
    "SELECT * FROM attendance WHERE employee_id=? AND attendance_date=?",
    [employeeId, today]
  );

  if (!rows.length) return null;

  const record = rows[0];
  if (record.check_out) return record;

  const newStatus = calcStatus(record.check_in, now);

  await db.execute(
    "UPDATE attendance SET check_out=?, attendance_status_id=? WHERE attendance_id=?",
    [now, newStatus, record.attendance_id]
  );

  return record;
};