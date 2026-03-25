const Role = require("../models/roleModel");

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.getAllRoles();

    res.json({
      success: true,
      data: roles
    });

  } catch (err) {
    res.status(500).json({
      message: "Database error",
      error: err.message
    });
  }
};

exports.getRole = async (req, res) => {
  try {

    const role = await Role.getRoleById(req.params.id);

    res.json({
      success: true,
      data: role
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }
};

exports.createRole = async (req, res) => {

  try {

    const result = await Role.createRole(req.body);

    res.json({
      message: "Role created",
      role_id: result.insertId
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

};

exports.updateRole = async (req, res) => {

  try {

    await Role.updateRole(req.params.id, req.body);

    res.json({
      message: "Role updated"
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

};

exports.deleteRole = async (req, res) => {

  try {

    await Role.deleteRole(req.params.id);

    res.json({
      message: "Role deleted"
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

};