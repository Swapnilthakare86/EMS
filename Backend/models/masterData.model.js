const db = require("../config/db");

// GET ALL
exports.getAllMasterData = async () => {
  const [rows] = await db.execute("SELECT * FROM master_data");
  return rows;
};

// GET BY ID
exports.getMasterDataById = async (id) => {
  const [rows] = await db.execute(
    "SELECT * FROM master_data WHERE master_data_id = ?",
    [id]
  );
  return rows;
};

// GET BY CATEGORY
exports.getByCategory = async (category) => {
  const [rows] = await db.execute(
    "SELECT * FROM master_data WHERE category = ?",
    [category]
  );
  return rows;
};

// GET ONLY CATEGORIES
exports.getOnlyCategories = async () => {
  const [rows] = await db.execute(
    "SELECT DISTINCT category FROM master_data"
  );
  return rows;
};