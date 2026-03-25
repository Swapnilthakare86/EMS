const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: process.env.TZ || "Z",
});

// Test connection
(async () => {
  try {
    const connection = await db.getConnection();
    console.log("MySQL Connected");
    connection.release();
  } catch (err) {
    console.error("DB connection failed:", err);
  }
})();

module.exports = db;