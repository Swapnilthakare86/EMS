const Company = require("../models/company.model");

exports.createCompany = async (req, res, next) => {
  try {
    const result = await Company.createCompany(req.body);
    res.status(201).json({
      message: "Company created",
      id: result.insertId
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllCompanies = async (req, res, next) => {
  try {
    const rows = await Company.getAllCompanies();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getCompanyById = async (req, res, next) => {
  try {
    const rows = await Company.getCompanyById(req.params.id);
    if (!rows.length) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.updateCompany = async (req, res, next) => {
  try {
    const result = await Company.updateCompany(req.params.id, req.body);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ message: "Company updated successfully" });
  } catch (err) {
    next(err);
  }
};

exports.deleteCompany = async (req, res, next) => {
  try {
    const result = await Company.deleteCompany(req.params.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ message: "Company deleted successfully" });
  } catch (err) {
    next(err);
  }
};