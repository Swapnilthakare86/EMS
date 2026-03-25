const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const transporter = require("../config/mailer");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_production";

function generateToken(payload, expiresIn = "1h") {
	return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function verifyToken(token) {
	return jwt.verify(token, JWT_SECRET);
}

async function hashPassword(password) {
	const salt = await bcrypt.genSalt(10);
	return bcrypt.hash(password, salt);
}

async function comparePassword(password, hashed) {
	return bcrypt.compare(password, hashed);
}

function generateResetToken() {
	const token = crypto.randomBytes(32).toString("hex");
	const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
	const expires = Date.now() + 60 * 60 * 1000; // 1 hour
	return { token, hashedToken, expires };
}

function sendEmail({ to, subject, text, html }) {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to,
		subject,
		text,
		html,
	};
	return transporter.sendMail(mailOptions);
}

module.exports = {
	generateToken,
	verifyToken,
	hashPassword,
	comparePassword,
	generateResetToken,
	sendEmail,
};

