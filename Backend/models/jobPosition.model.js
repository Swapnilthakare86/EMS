const db = require("../config/db");

// CREATE
exports.createJobPosition = async (data) => {
  const sql = `
    INSERT INTO job_position (department_id, position_title)
    VALUES (?, ?)
  `;

  const [result] = await db.execute(sql, [
    data.department_id,
    data.position_title
  ]);

  return result;
};

// GET ALL
exports.getAllJobPositions = async () => {
  const [rows] = await db.execute("SELECT * FROM job_position");
  return rows;
};

// GET BY ID
exports.getJobPositionById = async (id) => {
  const [rows] = await db.execute(
    "SELECT * FROM job_position WHERE job_position_id = ?",
    [id]
  );
  return rows;
};

// UPDATE
exports.updateJobPosition = async (id, data) => {
  const sql = `
    UPDATE job_position
    SET department_id = ?, position_title = ?
    WHERE job_position_id = ?
  `;

  const [result] = await db.execute(sql, [
    data.department_id,
    data.position_title,
    id
  ]);

  return result;
};

// DELETE
exports.deleteJobPosition = async (id) => {
  const [result] = await db.execute(
    "DELETE FROM job_position WHERE job_position_id = ?",
    [id]
  );

  return result;
};