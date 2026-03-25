const Location = require("../models/location.model");

// CREATE
exports.createLocation = async (req, res, next) => {
  try {
    const result = await Location.createLocation(req.body);
    res.status(201).json({
      message: "Location created",
      id: result.insertId
    });
  } catch (err) {
    next(err);
  }
};

// GET ALL
exports.getAllLocations = async (req, res, next) => {
  try {
    const rows = await Location.getAllLocations();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET BY ID
exports.getLocationById = async (req, res, next) => {
  try {
    const rows = await Location.getLocationById(req.params.id);

    if (!rows.length) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// UPDATE
exports.updateLocation = async (req, res, next) => {
  try {
    const result = await Location.updateLocation(req.params.id, req.body);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.json({ message: "Location updated successfully" });
  } catch (err) {
    next(err);
  }
};

// DELETE
exports.deleteLocation = async (req, res, next) => {
  try {
    const result = await Location.deleteLocation(req.params.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.json({ message: "Location deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// GET BY COMPANY ID
exports.getLocationsByCompanyId = async (req, res, next) => {
  try {
    const rows = await Location.getLocationsByCompanyId(req.params.company_id);

    if (!rows.length) {
      return res.status(404).json({ message: "No locations found for this company" });
    }

    res.json(rows);
  } catch (err) {
    next(err);
  }
};