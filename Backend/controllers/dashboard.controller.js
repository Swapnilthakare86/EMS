const db = require("../config/db");

exports.getSummary = async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [[row]] = await db.execute(
      `SELECT
        (SELECT COUNT(*) FROM employee)   AS total_employees,
        (SELECT COUNT(*) FROM department)   AS total_departments,
        (SELECT COUNT(*) FROM job_position)  AS total_positions,
        (SELECT COUNT(*) FROM company)      AS total_companies,
        (SELECT COUNT(*) FROM attendance   WHERE DATE(attendance_date) = ? AND check_in IS NOT NULL) AS present_today,
        (SELECT COUNT(*) FROM leave_request WHERE ? BETWEEN start_date AND end_date
          AND status_id = (SELECT master_data_id FROM master_data WHERE category='leave_status' AND value='Approved' LIMIT 1)) AS on_leave_today`,
      [today, today]
    );
    res.json(row);
  } catch (err) {
    next(err);
  }
};
