const db = require("../config/db");
const { getAttendanceDateTime } = require("../utils/attendanceTime");

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
  const { attendanceDate, attendanceTime } = getAttendanceDateTime();

  const [rows] = await db.execute(
    "SELECT * FROM attendance WHERE employee_id=? AND attendance_date=?",
    [employeeId, attendanceDate]
  );

  if (rows.length) {
    const record = rows[0];

    if (record.check_in) return record;

    await db.execute(
      `UPDATE attendance
       SET check_in=?, attendance_status_id=?, remarks=?
       WHERE attendance_id=?`,
      [attendanceTime, 4, "System Checkin", record.attendance_id]
    );

    return { ...record, check_in: attendanceTime, attendance_status_id: 4 };
  }

  const [result] = await db.execute(
    `INSERT INTO attendance
     (employee_id, attendance_date, check_in, attendance_status_id, remarks)
     VALUES (?, ?, ?, ?, 'System Checkin')`,
    [employeeId, attendanceDate, attendanceTime, 4]
  );

  return result;
};


exports.markLogout = async (employeeId) => {
  const { attendanceDate, attendanceTime } = getAttendanceDateTime();

  const [rows] = await db.execute(
    "SELECT * FROM attendance WHERE employee_id=? AND attendance_date=?",
    [employeeId, attendanceDate]
  );

  if (!rows.length) return null;

  const record = rows[0];
  if (!record.check_in) return record;

  const latestCheckout =
    record.check_out && record.check_out > attendanceTime
      ? record.check_out
      : attendanceTime;

  if (record.check_out === latestCheckout) return record;

  const newStatus = calcStatus(record.check_in, latestCheckout);

  await db.execute(
    "UPDATE attendance SET check_out=?, attendance_status_id=? WHERE attendance_id=?",
    [latestCheckout, newStatus, record.attendance_id]
  );

  return { ...record, check_out: latestCheckout, attendance_status_id: newStatus };
};
