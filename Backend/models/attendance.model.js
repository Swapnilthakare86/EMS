const db = require("../config/db");

/* =========================
   CREATE ATTENDANCE
========================= */

// attendance_status_id: 4=Present, 5=Absent, 13=Half Day
const calcStatus = (checkIn, checkOut) => {
  if (!checkIn) return 5;                          // no check_in → Absent
  if (!checkOut) return 4;                         // checked in, not out yet → Present
  const start = new Date(`1970-01-01T${checkIn}`);
  const end   = new Date(`1970-01-01T${checkOut}`);
  if (end <= start) return 5;                      // invalid range → Absent
  const hours = (end - start) / (1000 * 60 * 60);
  if (hours >= 8.5) return 4;                      // >= 8.5 hrs → Present
  if (hours >= 4)   return 13;                     // 4–8.5 hrs → Half Day
  return 5;                                        // < 4 hrs → Absent
};

exports.createAttendance = async (data) => {

  const sql = `
  INSERT INTO attendance
  (employee_id, attendance_date, check_in, check_out, attendance_status_id, remarks)
  VALUES (?, DATE(?), ?, ?, ?, ?)
  `;

  const [result] = await db.execute(sql,[
    data.employee_id,
    data.attendance_date,
    data.check_in || null,
    data.check_out || null,
    calcStatus(data.check_in, data.check_out),
    data.remarks
  ]);

  return result;

};


/* =========================
   GET ALL ATTENDANCE
========================= */

exports.getAllAttendance = async () => {

  const [rows] = await db.execute(
  `SELECT 
    a.attendance_id,
    a.employee_id,
    DATE(a.attendance_date) AS attendance_date,
    a.check_in,
    a.check_out,
    a.attendance_status_id,
    a.remarks,
    e.employee_code,
    e.first_name,
    e.last_name
  FROM attendance a
  JOIN employee e
  ON a.employee_id = e.employee_id
  ORDER BY attendance_date DESC`
  );

  return rows;

};


exports.getMyAttendance = async (employeeId) => {
  const [rows] = await db.execute(
    `SELECT attendance_id, employee_id, DATE(attendance_date) AS attendance_date,
            check_in, check_out, attendance_status_id, remarks
     FROM attendance
     WHERE employee_id = ?
     ORDER BY attendance_date DESC`,
    [employeeId]
  );
  return rows;
};


/* =========================
   UPDATE ATTENDANCE
========================= */

exports.autoCheckout = async (employeeId) => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const checkOut = `${hh}:${mm}:${ss}`;
  const today = now.toISOString().slice(0, 10);

  // Only update if checked-in today and check_out is null
  const [rows] = await db.execute(
    `SELECT attendance_id, check_in FROM attendance
     WHERE employee_id = ? AND DATE(attendance_date) = ? AND check_in IS NOT NULL AND (check_out IS NULL OR check_out = '00:00:00')
     LIMIT 1`,
    [employeeId, today]
  );
  if (!rows.length) return null;

  const { attendance_id, check_in } = rows[0];
  const status = calcStatus(check_in, checkOut);

  const [result] = await db.execute(
    `UPDATE attendance SET check_out = ?, attendance_status_id = ? WHERE attendance_id = ?`,
    [checkOut, status, attendance_id]
  );
  return result;
};

exports.updateAttendance = async (id,data) => {

  const sql = `
  UPDATE attendance
  SET
    check_in = ?,
    check_out = ?,
    attendance_status_id = ?,
    remarks = ?
  WHERE attendance_id = ?
  `;

  const [result] = await db.execute(sql,[
    data.check_in || null,
    data.check_out || null,
    calcStatus(data.check_in, data.check_out),
    data.remarks,
    id
  ]);

  return result;

};