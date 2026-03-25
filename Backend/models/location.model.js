const db = require("../config/db");

// CREATE
exports.createLocation = async (data) => {
  const sql = `
    INSERT INTO location 
    (company_id, location_name, address, city, state, country)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.execute(sql, [
    data.company_id,
    data.location_name,
    data.address,
    data.city,
    data.state,
    data.country
  ]);

  return result;
};

// GET ALL
exports.getAllLocations = async () => {
  const [rows] = await db.execute("SELECT * FROM location");
  return rows;
};

// GET BY ID
exports.getLocationById = async (id) => {
  const [rows] = await db.execute(
    "SELECT * FROM location WHERE location_id = ?",
    [id]
  );
  return rows;
};

// UPDATE
exports.updateLocation = async (id, data) => {
  const sql = `
    UPDATE location
    SET company_id = ?, location_name = ?, address = ?, city = ?, state = ?, country = ?
    WHERE location_id = ?
  `;

  const [result] = await db.execute(sql, [
    data.company_id,
    data.location_name,
    data.address,
    data.city,
    data.state,
    data.country,
    id
  ]);

  return result;
};

// DELETE
exports.deleteLocation = async (id) => {
  const [result] = await db.execute(
    "DELETE FROM location WHERE location_id = ?",
    [id]
  );
  return result;
};

//  GET BY COMPANY ID
exports.getLocationsByCompanyId = async (company_id) => {
  const [rows] = await db.execute(
    "SELECT * FROM location WHERE company_id = ?",
    [company_id]
  );
  return rows;
};