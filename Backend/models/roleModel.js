const db = require("../config/db");

exports.getAllRoles = async () => {
  const [rows] = await db.query("SELECT * FROM role");
  return rows;
};

exports.getRoleById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM role WHERE role_id = ?",
    [id]
  );
  return rows;
};

exports.createRole = async (data) => {
  const [result] = await db.query(
    "INSERT INTO role (role_name) VALUES (?)",
    [data.role_name]
  );
  return result;
};

exports.updateRole = async (id, data) => {
  const [result] = await db.query(
    "UPDATE role SET role_name=? WHERE role_id=?",
    [data.role_name, id]
  );
  return result;
};

exports.deleteRole = async (id) => {
  const [result] = await db.query(
    "DELETE FROM role WHERE role_id=?",
    [id]
  );
  return result;
};