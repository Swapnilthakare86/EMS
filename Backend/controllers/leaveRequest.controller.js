const LeaveRequest = require("../models/leaveRequest.model");

// CREATE
exports.addLeave = async (req, res, next) => {
  try {
    const result = await LeaveRequest.createLeaveRequest(req.body);

    res.status(201).json({
      message: "Leave request created",
      id: result.insertId
    });

  } catch (err) {
    next(err);
  }
};


// GET ALL
exports.getAllLeaves = async (req, res, next) => {
  try {
    const rows = await LeaveRequest.getAllLeaveRequests();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};


// GET BY ID
exports.getLeaveById = async (req, res, next) => {
  try {

    const rows = await LeaveRequest.getLeaveRequestById(req.params.id);

    if (!rows.length) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.json(rows[0]);

  } catch (err) {
    next(err);
  }
};


// UPDATE FULL
exports.updateLeave = async (req, res, next) => {
  try {

    const result = await LeaveRequest.updateLeaveRequest(
      req.params.id,
      req.body
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.json({ message: "Leave updated successfully" });

  } catch (err) {
    next(err);
  }
};


// UPDATE STATUS
exports.updateLeaveStatus = async (req, res, next) => {
  try {

    const { status_id, approved_by } = req.body;

    const result = await LeaveRequest.updateLeaveStatus(
      req.params.id,
      { status_id, approved_by }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.json({
      message: "Leave status updated successfully"
    });

  } catch (err) {
    next(err);
  }
};


// DELETE
exports.deleteLeave = async (req, res, next) => {
  try {

    const result = await LeaveRequest.deleteLeaveRequest(req.params.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.json({
      message: "Leave deleted successfully"
    });

  } catch (err) {
    next(err);
  }
};


// GET BY EMPLOYEE
exports.getLeaveByEmpId = async (req, res, next) => {
  try {

    const rows = await LeaveRequest.getLeaveRequestsByEmployeeId(req.params.empId);

    if (!rows.length) {
      return res.status(404).json({
        message: "No leave requests found for this employee"
      });
    }

    res.json(rows);

  } catch (err) {
    next(err);
  }
};