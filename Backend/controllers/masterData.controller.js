const MasterData = require("../models/masterData.model");

exports.getAllMasterData = async (req, res, next) => {
  try {
    const rows = await MasterData.getAllMasterData();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getMasterDataById = async (req, res, next) => {
  try {
    const rows = await MasterData.getMasterDataById(req.params.id);

    if (!rows.length) {
      return res.status(404).json({ message: "Master data not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.getMasterDataByCategory = async (req, res, next) => {
  try {
    const rows = await MasterData.getByCategory(req.params.category);

    if (!rows.length) {
      return res
        .status(404)
        .json({ message: "No data found for this category" });
    }

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getOnlyCategories = async (req, res, next) => {
  try {
    const rows = await MasterData.getOnlyCategories();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};