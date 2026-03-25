import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./attendance.css";
import { formatTime, formatHours, getWorkingHours, todayUTC } from "../../utils/timeUtils";

// DB status IDs
const STATUS_PRESENT  = 4;
const STATUS_ABSENT   = 5;
const STATUS_HALF_DAY = 13;

const SHIFT_START_UTC = "04:30:00"; // 10:00 AM IST = 04:30 UTC
const REQUIRED_HOURS  = 8.5;
const HALF_DAY_MIN    = 4;

const formatDate = (d) => {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
};

// Calculate live status for TODAY only (not stored yet)
const calcLiveStatus = (checkIn, checkOut) => {
  if (!checkIn || checkIn === "-") return "A";
  if (!checkOut || checkOut === "-" || checkOut === "00:00:00") return "P"; // still working
  const hours = getWorkingHours(checkIn, checkOut);
  if (hours >= REQUIRED_HOURS) return "P";
  if (hours >= HALF_DAY_MIN)   return "HD";
  return "A"; // < 4 hrs = absent
};

// Map DB status_id to display label for past dates
const dbStatusToLabel = (statusId) => {
  if (statusId === STATUS_PRESENT)  return "P";
  if (statusId === STATUS_HALF_DAY) return "HD";
  if (statusId === STATUS_ABSENT)   return "A";
  return "A";
};

function Attendance() {
  const [employee,       setEmployee]       = useState(null);
  const [attendance,     setAttendance]     = useState([]);
  const [leaves,         setLeaves]         = useState([]);
  const [approvedSid,    setApprovedSid]    = useState(null);
  const [calendarDate,   setCalendarDate]   = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [summary,        setSummary]        = useState({ working: 0, present: 0, absent: 0, halfDay: 0, leave: 0 });

  const employeeId = Number(localStorage.getItem("employee_id"));
  const todayStr   = todayUTC();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [empRes, attRes, leaveRes, statusRes] = await Promise.all([
        axiosClient.get(`/employees/${employeeId}`),
        axiosClient.get("/attendance/my"),
        axiosClient.get(`/leave/employee/${employeeId}`).catch(e => e.response?.status === 404 ? { data: [] } : Promise.reject(e)),
        axiosClient.get("/master-data/category/leave_status"),
      ]);

      const emp      = empRes.data?.data || empRes.data;
      const attData  = attRes.data?.data || attRes.data || [];
      const leaveData = leaveRes.data?.data || leaveRes.data || [];
      const statuses = statusRes.data?.data || statusRes.data || [];
      const approved = statuses.find(s => s.value === "Approved");

      setEmployee(emp);
      setAttendance(attData);
      setLeaves(leaveData);
      if (approved) setApprovedSid(approved.master_data_id);

      // Auto-show today
      showRecord(new Date(), emp, attData, leaveData, approved?.master_data_id);
    } catch (err) {
      console.error(err);
    }
  };

  const isOnLeave = (ds, leaveData, sid) =>
    leaveData.some(l =>
      l.status_id === sid &&
      l.start_date <= ds &&
      l.end_date   >= ds
    );

  // Build record for a given date
  const showRecord = (date, emp, attData, leaveData, sid) => {
    if (!emp) return;
    const ds  = formatDate(date);
    const day = date.getDay();
    const att = attData.find(a => a.attendance_date?.slice(0, 10) === ds);
    const onLeave = isOnLeave(ds, leaveData, sid ?? approvedSid);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const isToday   = ds === todayStr;
    const isFuture  = date > today;
    const isWeekend = day === 0 || day === 6;

    let status;
    if (isWeekend)     status = "WO";
    else if (isFuture) status = onLeave ? "L" : "-";
    else if (onLeave)  status = "L";
    else if (isToday)  status = calcLiveStatus(att?.check_in, att?.check_out);
    else               status = att ? dbStatusToLabel(att.attendance_status_id) : "A";

    const isLate = att?.check_in && att.check_in !== "-" &&
      new Date(`1970-01-01T${att.check_in}Z`) > new Date(`1970-01-01T${SHIFT_START_UTC}Z`);

    setSelectedRecord({
      date: ds,
      employee_code: emp.employee_code,
      first_name:    emp.first_name,
      check_in:      att?.check_in  || "-",
      check_out:     att?.check_out || "-",
      status,
      late: status !== "L" && status !== "WO" && !!isLate,
    });
    setCalendarDate(date);
  };

  // Monthly summary
  useEffect(() => {
    if (!employee) return;
    const now   = new Date();
    const month = now.getMonth();
    const year  = now.getFullYear();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayDs  = formatDate(today);
    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
    const joining  = new Date(employee.hire_date); joining.setHours(0, 0, 0, 0);
    const lastDay  = new Date(year, month + 1, 0).getDate();

    // Count taken leave days: approved leaves that have already started this month (start_date <= today)
    const takenLeave = leaves
      .filter(l =>
        l.status_id === approvedSid &&
        l.start_date.slice(0, 7) === monthStr &&
        l.start_date <= todayDs          // only past/today leaves, not future
      )
      .reduce((sum, l) => {
        // count only days up to today if leave spans into future
        const end   = l.end_date <= todayDs ? l.end_date : todayDs;
        const start = new Date(l.start_date);
        const endD  = new Date(end);
        let days = 0;
        for (let d = new Date(start); d <= endD; d.setDate(d.getDate() + 1)) {
          const day = d.getDay();
          if (day !== 0 && day !== 6) days++; // exclude weekends
        }
        return sum + days;
      }, 0);

    let working = 0, present = 0, absent = 0, halfDay = 0;

    for (let d = 1; d <= lastDay; d++) {
      const date = new Date(year, month, d);
      if (date < joining || date > today) continue;
      const day = date.getDay();
      if (day === 0 || day === 6) continue;
      working++;

      const ds      = formatDate(date);
      const att     = attendance.find(a => a.attendance_date?.slice(0, 10) === ds);
      const onLeave = isOnLeave(ds, leaves, approvedSid);

      if (onLeave) continue; // leave days excluded from P/A/HD counts

      if (ds === todayStr) {
        const s = calcLiveStatus(att?.check_in, att?.check_out);
        if (s === "P")       present++;
        else if (s === "HD") halfDay++;
        else                 absent++;
      } else if (att) {
        if (att.attendance_status_id === STATUS_PRESENT)       present++;
        else if (att.attendance_status_id === STATUS_HALF_DAY) halfDay++;
        else                                                    absent++;
      } else {
        absent++;
      }
    }
    setSummary({ working, present, absent, halfDay, leave: takenLeave });
  }, [attendance, leaves, employee, approvedSid]);

  // Calendar tile
  const tileContent = ({ date, view }) => {
    if (view !== "month" || !employee) return null;
    const today   = new Date(); today.setHours(0, 0, 0, 0);
    const joining = new Date(employee.hire_date); joining.setHours(0, 0, 0, 0);
    if (date < joining) return null;

    const ds      = formatDate(date);
    const day     = date.getDay();
    const isFuture = date > today;
    const att     = attendance.find(a => a.attendance_date?.slice(0, 10) === ds);
    const onLeave = isOnLeave(ds, leaves, approvedSid);
    const isToday = ds === todayStr;

    let label, cls;
    if (day === 0 || day === 6) {
      if (isFuture) return null;  // don't mark future weekends
      label = "WO"; cls = "bg-secondary text-white";
    } else if (onLeave) {
      label = "L"; cls = "bg-warning text-dark";  // show L for both past and future approved leave
    } else if (isFuture) {
      return null;  // future non-leave dates: no badge
    } else if (isToday) {
      const s = calcLiveStatus(att?.check_in, att?.check_out);
      if (s === "P")       { label = "P";  cls = "bg-success text-white"; }
      else if (s === "HD") { label = "HD"; cls = "bg-info text-dark"; }
      else                 { label = "A";  cls = "bg-danger text-white"; }
    } else if (att) {
      if (att.attendance_status_id === STATUS_PRESENT)       { label = "P";  cls = "bg-success text-white"; }
      else if (att.attendance_status_id === STATUS_HALF_DAY) { label = "HD"; cls = "bg-info text-dark"; }
      else                                                    { label = "A";  cls = "bg-danger text-white"; }
    } else {
      label = "A"; cls = "bg-danger text-white";
    }

    return (
      <div className={`badge rounded-pill ${cls}`} style={{ fontSize: "0.65rem", padding: "2px 6px" }}>
        {label}
      </div>
    );
  };

  const tileClassName = ({ view }) => view !== "month" ? "" : "d-flex align-items-center justify-content-center";

  const badgeCls = (s) => ({
    P: "badge bg-success", A: "badge bg-danger",
    HD: "badge bg-info text-dark", L: "badge bg-warning text-dark",
    WO: "badge bg-secondary"
  }[s] || "badge bg-light");

  const statusLabel = (s) => ({ P: "Present", A: "Absent", HD: "Half Day", L: "On Leave", WO: "Week Off" }[s] || s);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h4>Attendance Calendar</h4>
        <Link className="btn btn-secondary" to="/dashboard">Back</Link>
      </div>

      <div className="alert alert-info d-flex flex-wrap gap-2 align-items-center">
        <strong>Legend:</strong>
        {[["bg-success","P","Present"],["bg-danger","A","Absent"],["bg-info text-dark","HD","Half Day"],["bg-warning text-dark","L","Leave"],["bg-secondary","WO","Weekend"]].map(([cls,lbl,txt]) => (
          <span key={lbl}><span className={`badge ${cls} me-1`}>{lbl}</span>{txt}</span>
        ))}
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <strong>Monthly Summary</strong>
          <div className="row mt-2 text-center">
            {[
              ["Working Days", summary.working, ""],
              ["Present",      summary.present,  "text-success"],
              ["Half Day",     summary.halfDay,   "text-info"],
              ["Absent",       summary.absent,    "text-danger"],
              ["On Leave",     summary.leave,     "text-warning"],
            ].map(([lbl, val, cls]) => (
              <div className="col" key={lbl}>
                <div className={`fw-bold fs-5 ${cls}`}>{val}</div>
                <div className="text-muted small">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-5">
          <Calendar
            onClickDay={d => showRecord(d, employee, attendance, leaves, approvedSid)}
            value={calendarDate}
            tileContent={tileContent}
            tileClassName={tileClassName}
          />
        </div>

        <div className="col-md-7">
          <div className="card shadow">
            <div className="card-header bg-dark text-white">
              Attendance on {selectedRecord?.date || todayStr}
            </div>
            <div className="card-body">
              {!selectedRecord ? (
                <p className="text-center text-muted">Click a date to view details</p>
              ) : (
                <table className="table table-bordered mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Employee</th><th>Check In</th><th>Check Out</th>
                      <th>Status</th><th>Total Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{selectedRecord.employee_code} - {selectedRecord.first_name}</td>
                      <td>{formatTime(selectedRecord.check_in)}</td>
                      <td>{formatTime(selectedRecord.check_out)}</td>
                      <td>
                        <span className={badgeCls(selectedRecord.status)}>
                          {statusLabel(selectedRecord.status)}
                        </span>
                        {selectedRecord.late && <span className="badge bg-warning text-dark ms-1">Late</span>}
                      </td>
                      <td>{formatHours(selectedRecord.check_in, selectedRecord.check_out, selectedRecord.date === todayStr)}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Attendance;
