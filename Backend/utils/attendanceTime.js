const ATTENDANCE_TIMEZONE = "Asia/Kolkata";

const getAttendanceDate = (value = new Date()) =>
  value.toLocaleDateString("en-CA", { timeZone: ATTENDANCE_TIMEZONE });

const getAttendanceTime = (value = new Date()) =>
  value.toLocaleTimeString("en-GB", {
    timeZone: ATTENDANCE_TIMEZONE,
    hour12: false,
  });

const getAttendanceDateTime = (value = new Date()) => ({
  attendanceDate: getAttendanceDate(value),
  attendanceTime: getAttendanceTime(value),
});

module.exports = {
  ATTENDANCE_TIMEZONE,
  getAttendanceDate,
  getAttendanceTime,
  getAttendanceDateTime,
};
