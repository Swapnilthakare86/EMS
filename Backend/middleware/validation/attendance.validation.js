const { body, param } = require("express-validator");
const db = require("../../config/db");

const time12hr = /^(0[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;

/* CREATE */

exports.createAttendanceValidation = [

  body("employee_id")
    .isInt().withMessage("Employee ID must be integer"),

  body("attendance_date")
    .isISO8601().withMessage("Date must be YYYY-MM-DD"),

  body("check_in")
    .matches(time12hr)
    .withMessage("Check-in must be hh:mm AM/PM"),

  body("check_out")
    .optional()
    .matches(time12hr)
    .withMessage("Check-out must be hh:mm AM/PM"),

  body("attendance_status_id")
    .isInt().withMessage("Status must be integer")

];


/* UPDATE */

exports.updateAttendanceValidation = [

  param("id")
    .isInt()
    .custom(async (id)=>{

      const [rows] = await db.execute(
        "SELECT attendance_id FROM attendance WHERE attendance_id=?",
        [id]
      );

      if(!rows.length){
        throw new Error("Attendance not found");
      }

      return true;
    }),

  body("check_in")
    .optional()
    .matches(time12hr)
    .withMessage("Check-in must be hh:mm AM/PM"),

  body("check_out")
    .optional()
    .matches(time12hr)
    .withMessage("Check-out must be hh:mm AM/PM")

];