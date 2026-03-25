"use strict";

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

  host: "smtp.zoho.in",
  port: 465,
  secure: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }

});

transporter.verify(function(error) {

  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP SERVER READY");
  }

});

module.exports = transporter;