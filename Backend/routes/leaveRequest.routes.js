const express = require("express");
const router = express.Router();
const leaveRequestController = require("../controllers/leaveRequest.controller");
const { verifyToken } = require("../middleware/auth");

// CREATE
router.post("/", verifyToken, leaveRequestController.addLeave);

// READ ALL
router.get("/", verifyToken, leaveRequestController.getAllLeaves);

// READ BY ID
router.get("/:id", verifyToken, leaveRequestController.getLeaveById);

// UPDATE FULL LEAVE
router.put("/:id", verifyToken, leaveRequestController.updateLeave);

// UPDATE STATUS ONLY
router.put("/status/:id", verifyToken, leaveRequestController.updateLeaveStatus);

// DELETE
router.delete("/:id", verifyToken, leaveRequestController.deleteLeave);

// READ BY EMPLOYEE
router.get("/employee/:empId", verifyToken, leaveRequestController.getLeaveByEmpId);

module.exports = router;