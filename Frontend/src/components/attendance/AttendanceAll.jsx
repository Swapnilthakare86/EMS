import { useEffect, useState, useMemo } from "react";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

function AttendanceAll() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [approvedStatusId, setApprovedStatusId] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const today = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 10;
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const loggedInEmployeeId = Number(localStorage.getItem("employee_id"));
  const isAdminHRManager = role === "Admin" || role === "HR" || role === "Manager";
  const isAdminHR = role === "Admin" || role === "HR" || role === "Manager";

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [attRes, empRes, leaveRes, statusRes] = await Promise.all([
        axiosClient.get("/attendance"),
        axiosClient.get("/employees"),
        axiosClient.get("/leave"),
        axiosClient.get("/master-data/category/leave_status"),
      ]);
      setAttendance(attRes.data.data || attRes.data);
      setEmployees(empRes.data.data || empRes.data);
      setLeaves(leaveRes.data.data || leaveRes.data);
      const statuses = statusRes.data.data || statusRes.data;
      const approved = statuses.find(s => s.value === "Approved");
      if (approved) setApprovedStatusId(approved.master_data_id);
    } catch (err) {
      console.error(err);
      alert("Error fetching data");
    }
  };

  const attendanceMap = useMemo(() => {
    const map = {};
    attendance.forEach(a => {
      const key = `${a.employee_id}_${a.attendance_date?.slice(0, 10)}`;
      map[key] = a;
    });
    return map;
  }, [attendance]);

  function formatTime12(time) {
    if (!time || time === "-" || time === "00:00:00") return "-";
    const [hour, minute] = time.split(":");
    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${minute} ${ampm}`;
  }

  function getWorkingHours(checkIn, checkOut) {
    if (!checkIn || !checkOut || checkIn === "-" || checkOut === "-" || checkOut === "00:00:00") return 0;
    const start = new Date(`1970-01-01T${checkIn}`);
    const end = new Date(`1970-01-01T${checkOut}`);
    if (end <= start) return 0;
    return (end - start) / (1000 * 60 * 60);
  }

  function formatHours(checkIn, checkOut) {
    const h = getWorkingHours(checkIn, checkOut);
    if (!h) return "-";
    const hrs = Math.floor(h);
    const mins = Math.floor((h % 1) * 60);
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  }

  function isLate(checkIn) {
    if (!checkIn || checkIn === "-") return false;
    return new Date(`1970-01-01T${checkIn}`) > new Date(`1970-01-01T10:00:00`);
  }

  function isHalfDay(checkIn, checkOut) {
    const h = getWorkingHours(checkIn, checkOut);
    return h >= 4 && h < 8.5;
  }

  // Single-date rows for Employee role
  const todayStr = new Date().toISOString().slice(0, 10);
  const isFuture = date > todayStr;
  const dayOfWeek = new Date(date).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const singleDateRows = useMemo(() => {
    if (isAdminHRManager) return [];
    return employees.map(emp => {
      if (isWeekend) {
        return { ...emp, check_in: "-", check_out: "-", status: "WO", total_hours: "-", late: false, halfDay: false };
      }
      const att = attendanceMap[`${emp.employee_id}_${date}`];
      const checkInVal = att?.check_in || "-";
      const checkOutVal = att?.check_out || "-";
      const onLeave = leaves.some(
        l =>
          Number(l.employee_id) === Number(emp.employee_id) &&
          l.status_id === approvedStatusId &&
          l.start_date <= date &&
          l.end_date >= date
      );
      let status;
      if (isFuture) {
        status = onLeave ? "L" : "-";
        return { ...emp, check_in: "-", check_out: "-", status, total_hours: "-", late: false, halfDay: false };
      }
      if (onLeave) status = "L";
      else if (checkInVal !== "-") status = "P";
      else status = "A";
      return {
        ...emp,
        check_in: checkInVal,
        check_out: checkOutVal,
        status,
        total_hours: formatHours(checkInVal, checkOutVal),
        late: status !== "L" && isLate(checkInVal),
        halfDay: status !== "L" && isHalfDay(checkInVal, checkOutVal),
      };
    });
  }, [isAdminHRManager, employees, attendanceMap, leaves, date, isFuture, isWeekend, approvedStatusId]);

  // For Manager: only employees reporting to them; for Admin/HR: all employees
  const scopedEmployees = useMemo(() => {
    if (role === "Manager") {
      return employees.filter(e => Number(e.reporting_manager_id) === loggedInEmployeeId);
    }
    return employees;
  }, [role, employees, loggedInEmployeeId]);

  // Date-range rows for Admin/HR/Manager — one row per employee per working day
  const rangeRows = useMemo(() => {
    if (!isAdminHRManager || !dateFrom || !dateTo) return [];
    const dates = [];
    const cur = new Date(dateFrom);
    const end = new Date(dateTo);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) dates.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }
    const attMap = {};
    attendance.forEach(a => { attMap[`${a.employee_id}_${a.attendance_date?.slice(0, 10)}`] = a; });
    const result = [];
    for (const d of dates) {
      for (const emp of scopedEmployees) {
        const a = attMap[`${emp.employee_id}_${d}`];
        const checkInVal = a?.check_in || "-";
        const checkOutVal = a?.check_out || "-";
        const onLeave = leaves.some(
          l =>
            Number(l.employee_id) === Number(emp.employee_id) &&
            l.status_id === approvedStatusId &&
            l.start_date <= d &&
            l.end_date >= d
        );
        let status;
        if (onLeave) status = "L";
        else if (checkInVal !== "-") status = "P";
        else status = "A";
        result.push({
          key: `${emp.employee_id}_${d}`,
          attendance_date: d,
          employee_code: emp.employee_code,
          first_name: emp.first_name,
          check_in: checkInVal,
          check_out: checkOutVal,
          status,
          total_hours: formatHours(checkInVal, checkOutVal),
          late: status !== "L" && isLate(checkInVal),
          halfDay: status !== "L" && isHalfDay(checkInVal, checkOutVal),
        });
      }
    }
    return result;
  }, [isAdminHRManager, attendance, scopedEmployees, leaves, approvedStatusId, dateFrom, dateTo]);

  const activeRows = isAdminHRManager ? rangeRows : singleDateRows;
  let filteredRows = statusFilter === "all" ? activeRows : activeRows.filter(r => r.status === statusFilter);
  if (isAdminHR && employeeFilter) {
    filteredRows = filteredRows.filter(r => r.employee_code === employeeFilter);
  }

  const presentCount = activeRows.filter(r => r.status === "P").length;
  const absentCount = activeRows.filter(r => r.status === "A").length;
  const leaveCount = activeRows.filter(r => r.status === "L").length;

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / recordsPerPage));
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRows = filteredRows.slice(indexOfFirstRecord, indexOfLastRecord);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Attendance List</h4>
        <button className="btn btn-secondary" onClick={() => navigate("/dashboard")}>Back</button>
      </div>

      <div className="row mb-3">
        {!isAdminHRManager && (
          <div className="col-md-3">
            <label>Select Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={e => { setDate(e.target.value); setStatusFilter("all"); setCurrentPage(1); }}
            />
          </div>
        )}
        {isAdminHR && (
          <div className="col-md-3">
            <label>Employee</label>
            <select
              className="form-select"
              value={employeeFilter}
              onChange={e => { setEmployeeFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">All Employees</option>
              {scopedEmployees.map(emp => (
                <option key={emp.employee_id} value={emp.employee_code}>
                  {emp.employee_code} - {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
          </div>
        )}
        {isAdminHRManager && (
          <>
            <div className="col-md-3">
              <label>From</label>
              <input
                type="date"
                className="form-control"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="col-md-3">
              <label>To</label>
              <input
                type="date"
                className="form-control"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </>
        )}
      </div>

      <div className="d-flex justify-content-center mb-3 gap-2 flex-wrap">
        {[
          { label: "Present", count: presentCount, color: "success", status: "P" },
          { label: "Absent", count: absentCount, color: "danger", status: "A" },
          { label: "On Leave", count: leaveCount, color: "warning", status: "L" },
        ].map(card => (
          <div
            key={card.label}
            className={`card text-center text-white bg-${card.color}`}
            style={{ width: "100px", cursor: "pointer" }}
            onClick={() => { setStatusFilter(card.status); setCurrentPage(1); }}
          >
            <div className="card-body p-2">
              <div>{card.label}</div>
              <div className="fw-bold">{card.count}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              {isAdminHRManager && <th>Date</th>}
              <th>Employee</th>
              {statusFilter !== "L" && <th>Check In</th>}
              {statusFilter !== "L" && <th>Check Out</th>}
              <th>Status</th>
              {statusFilter !== "L" && <th>Total Hours</th>}
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((row, idx) => (
                <tr key={row.key || row.employee_id || idx}>
                  {isAdminHRManager && <td>{row.attendance_date}</td>}
                  <td>{row.employee_code} - {row.first_name}</td>
                  {statusFilter !== "L" && <td>{formatTime12(row.check_in)}</td>}
                  {statusFilter !== "L" && <td>{formatTime12(row.check_out)}</td>}
                  <td>
                    {row.status === "P" && <span className="badge bg-success">Present</span>}
                    {row.status === "A" && <span className="badge bg-danger">Absent</span>}
                    {row.status === "L" && <span className="badge bg-warning text-dark">On Leave</span>}
                    {row.status === "WO" && <span className="badge bg-secondary">WO</span>}
                    {row.status === "-" && <span>-</span>}
                    {row.late && <span className="badge bg-warning text-dark ms-1">Late</span>}
                    {row.halfDay && <span className="badge bg-info text-dark ms-1">Half Day</span>}
                  </td>
                  {statusFilter !== "L" && <td>{row.total_hours}</td>}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdminHRManager ? (statusFilter === "L" ? 3 : 6) : (statusFilter === "L" ? 2 : 5)} className="text-center text-muted">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <nav>
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
          </li>
          {pageNumbers.map(number => (
            <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(number)}>{number}</button>
            </li>
          ))}
          <li className={`page-item ${currentPage >= totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default AttendanceAll;
