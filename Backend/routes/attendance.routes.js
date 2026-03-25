const express = require("express");
const router = express.Router();

const controller = require("../controllers/attendance.controller");
const { verifyToken } = require("../middleware/auth");


router.post("/", verifyToken, controller.createAttendance);

router.post("/auto-checkout", controller.autoCheckout);

router.get("/my", verifyToken, controller.getMyAttendance);
router.get("/", verifyToken, controller.getAllAttendance);

router.put("/:id", verifyToken, controller.updateAttendance);


module.exports = router;