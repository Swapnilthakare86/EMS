import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function EmployeeLeaveList() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [leaveRes, empRes, statusRes] = await Promise.all([
        axios.get("http://localhost:3000/api/leave"),
        axios.get("http://localhost:3000/api/employees"),
        axios.get("http://localhost:3000/api/master-data/category/leave_status")
      ]);
      setLeaves(leaveRes.data.data || leaveRes.data || []);
      setEmployees(empRes.data.data || empRes.data || []);
      setStatuses(statusRes.data.data || statusRes.data || []);
    } catch (err) {
      console.error(err);
      alert("Error fetching leave data");
    }
  };

  let filteredLeaves = leaves;
  if (employeeFilter) {
    filteredLeaves = filteredLeaves.filter((l) => l.employee_id === Number(employeeFilter));
  }
  if (statusFilter) {
    filteredLeaves = filteredLeaves.filter((l) => {
      const st = statuses.find((s) => s.master_data_id === l.status_id);
      return st && st.value === statusFilter;
    });
  }
  if (dateFrom) {
    filteredLeaves = filteredLeaves.filter((l) => l.start_date?.slice(0, 10) >= dateFrom);
  }
  if (dateTo) {
    filteredLeaves = filteredLeaves.filter((l) => l.end_date?.slice(0, 10) <= dateTo);
  }
  const totalPages = Math.max(1, Math.ceil(filteredLeaves.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedLeaves = filteredLeaves.slice(startIdx, startIdx + pageSize);

  const getEmployee = (id) => {
    const emp = employees.find((e) => e.employee_id === id);
    return emp ? `${emp.employee_code} - ${emp.first_name} ${emp.last_name}` : id;
  };

  const getStatus = (id) => {
    const st = statuses.find((s) => s.master_data_id === id);
    return st ? st.value : id;
  };

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <div className="text-muted small">Overview</div>
            <h5 className="mb-3">Leave List</h5>
          </div>
          <button className="btn btn-outline-secondary" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
        </div>
        <div className="row mb-3">
          <div className="col-md-3">
            <label className="small text-muted">Employee</label>
            <select
              className="form-select form-select-sm"
              value={employeeFilter}
              onChange={(e) => { setEmployeeFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.employee_code} - {emp.first_name}
                </option>
              ))}
            </select>
          </div>
          {(role === "Admin" || role === "HR") && (
            <>
              <div className="col-md-3">
                <label className="small text-muted">From</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                />
              </div>
              <div className="col-md-3">
                <label className="small text-muted">To</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                />
              </div>
            </>
          )}
          <div className="col-md-3">
            <label className="small text-muted">Status</label>
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Status</option>
              {statuses.map((st) => (
                <option key={st.master_data_id} value={st.value}>
                  {st.value}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr className="table-light text-uppercase small">
                <th>ID</th>
                <th>Employee</th>
                <th>Start</th>
                <th>End</th>
                <th>Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeaves.map((l) => (
                <tr key={l.leave_request_id}>
                  <td>{l.leave_request_id}</td>
                  <td>{getEmployee(l.employee_id)}</td>
                  <td>{l.start_date?.slice(0, 10)}</td>
                  <td>{l.end_date?.slice(0, 10)}</td>
                  <td>{l.total_days}</td>
                  <td>{getStatus(l.status_id)}</td>
                </tr>
              ))}
              {paginatedLeaves.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Pagination */}
          {filteredLeaves.length > 0 && (
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                Showing {startIdx + 1}-{Math.min(startIdx + pageSize, filteredLeaves.length)} of {filteredLeaves.length}
              </div>
              <div className="btn-group">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeLeaveList;
