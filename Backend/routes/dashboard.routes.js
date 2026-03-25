const express = require("express");
const router  = express.Router();
const { verifyToken } = require("../middleware/auth");
const { getSummary }  = require("../controllers/dashboard.controller");

router.get("/summary", verifyToken, getSummary);

module.exports = router;
