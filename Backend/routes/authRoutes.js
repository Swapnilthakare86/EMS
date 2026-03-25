const express = require("express");
const router = express.Router();

const auth = require("../controllers/authController");

router.post("/register",auth.register);

router.post("/login",auth.login);

router.post("/logout",auth.logout);

router.post("/forgot-password",auth.forgotPassword);
router.get("/verify-reset-token/:token", auth.verifyResetToken);
router.post("/reset-password",auth.resetPassword);

module.exports = router;