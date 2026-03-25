const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../config/mailer");
const autoAttendance = require("../models/autoAttendance.model");


/* =========================
   REGISTER
========================= */

exports.register = async (req, res, next) => {

  try {

    const { employee_id, employee_code, username, password } = req.body;

    if (!employee_id || !employee_code || !username || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      `INSERT INTO User_Login
      (employee_id, employee_code, username, password_hash)
      VALUES (?,?,?,?)`,
      [employee_id, employee_code, username, hashedPassword]
    );

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (err) {

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "User already registered. Please login."
      });
    }

    next(err);
  }
};



/* =========================
   LOGIN
========================= */

exports.login = async (req, res, next) => {

  try {

    const { login_id, password } = req.body;

    if (!login_id || !password) {
      return res.status(400).json({
        message: "Login ID and password required"
      });
    }

    const [rows] = await db.execute(
      `SELECT
        ul.user_id,
        ul.employee_id,
        ul.employee_code,
        ul.username,
        ul.password_hash,
        e.role_id
      FROM User_Login ul
      JOIN Employee e ON ul.employee_id = e.employee_id
      WHERE (ul.employee_code=? OR ul.username=?)
      AND ul.is_active = 1`,
      [login_id, login_id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const user = rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        employee_id: user.employee_id,
        employee_code: user.employee_code,
        role: user.role_id
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );


    /* AUTO ATTENDANCE CHECK-IN */
    await autoAttendance.markLogin(user.employee_id);


    res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        employee_id: user.employee_id,
        employee_code: user.employee_code,
        username: user.username,
        role: user.role_id
      }
    });

  } catch (err) {
    next(err);
  }
};



/* =========================
   LOGOUT
========================= */

exports.logout = async (req, res, next) => {

  try {

    const { employee_id } = req.body;

    if (!employee_id) {
      return res.status(400).json({
        message: "Employee ID required"
      });
    }

    await autoAttendance.markLogout(employee_id);

    res.json({
      message: "Logout successful"
    });

  } catch (err) {
    next(err);
  }
};



/* =========================
   FORGOT PASSWORD
========================= */

exports.forgotPassword = async (req, res, next) => {

  try {

    const { login_id } = req.body;

    const [rows] = await db.execute(
      `SELECT
        u.employee_id,
        e.email
      FROM User_Login u
      JOIN Employee e
      ON u.employee_id = e.employee_id
      WHERE u.employee_code=? OR u.username=?`,
      [login_id, login_id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const user = rows[0];

    const token = jwt.sign(
      { employee_id: user.employee_id },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    const resetLink =
      `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await transporter.sendMail({

      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",

      html: `
<div style="background-color:#f5f7fb;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
  
  <table align="center" width="500" cellpadding="0" cellspacing="0"
  style="background:#ffffff;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,0.15);padding:30px;">

    <tr>
      <td align="center">

        <h2 style="color:#333;margin-bottom:10px;">
          Reset Your Password
        </h2>

        <p style="color:#666;font-size:15px;">
          We received a request to reset your password.
        </p>

        <p style="color:#666;font-size:15px;margin-bottom:25px;">
          Click the button below to create a new password.
        </p>

      </td>
    </tr>

    <tr>
      <td align="center">

        <a href="${resetLink}"
        style="
          background-color:#ffc107;
          color:#000;
          padding:12px 30px;
          text-decoration:none;
          border-radius:6px;
          font-weight:bold;
          display:inline-block;
          font-size:15px;
        ">
          Reset Password
        </a>

      </td>
    </tr>

    <tr>
      <td align="center" style="padding-top:25px;">

        <p style="color:#777;font-size:14px;">
          This link will expire in <strong>5 minutes</strong>.
        </p>

        <p style="color:#999;font-size:13px;">
          If you didn’t request a password reset, you can safely ignore this email.
        </p>

      </td>
    </tr>

  </table>

</div>
`
    });

    res.json({
      message: "Password reset link sent to your email"
    });

  } catch (err) {
    next(err);
  }

};


/* =========================
   RESET PASSWORD
========================= */

exports.resetPassword = async (req, res) => {

  try {

    const { token, password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      `UPDATE User_Login
       SET password_hash=?
       WHERE employee_id=?`,
      [hashedPassword, decoded.employee_id]
    );

    res.json({
      message: "Password updated successfully"
    });

  } catch (err) {

    if (err.name === "TokenExpiredError") {
      return res.status(400).json({
        message: "Reset link expired. Please request a new one."
      });
    }

    return res.status(400).json({
      message: "Invalid reset link"
    });

  }

};

/* =========================
   VERIFY RESET TOKEN
========================= */

exports.verifyResetToken = async (req, res) => {

  try {

    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message: "Token required"
      });
    }

    jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      valid: true
    });

  } catch (err) {

    if (err.name === "TokenExpiredError") {
      return res.status(400).json({
        message: "Reset link expired. Please request a new one."
      });
    }

    return res.status(400).json({
      message: "Invalid reset link"
    });

  }

};