import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function LeaveList() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [employeeFilter, setEmployeeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const loggedRole = localStorage.getItem("role");
  const loggedEmployeeId = Number(localStorage.getItem("employee_id")) || null;

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (loggedRole === "HR" && loggedEmployeeId) {
      setEmployeeFilter(String(loggedEmployeeId));
    }
    if (loggedRole !== "Manager") {
      setSelectedDate("");
    }
  }, [loggedRole, loggedEmployeeId]);

  useEffect(() => {
    setPage(1);
  }, [employeeFilter, statusFilter, selectedDate, loggedRole, loggedEmployeeId, leaves.length]);

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

  const cancelLeave = async (id) => {
    if (!window.confirm("Cancel this leave request?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/leave/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error cancelling leave");
    }
  };

  const getEmployee = (id) => {
    const emp = employees.find((e) => e.employee_id === id);
    return emp ? `${emp.employee_code} - ${emp.first_name} ${emp.last_name}` : id;
  };

  const getStatus = (id) => {
    const st = statuses.find((s) => s.master_data_id === id);
    return st ? st.value : id;
  };

  const getStatusBadge = (statusId) => {
    const status = getStatus(statusId);
    if (status === "Pending") return "badge bg-warning";
    if (status === "Approved") return "badge bg-success";
    if (status === "Rejected") return "badge bg-danger";
    return "badge bg-secondary";
  };

  // FILTER LOGIC

  let filteredLeaves = leaves;

  if (loggedRole === "Employee" && loggedEmployeeId) {
    filteredLeaves = filteredLeaves.filter((l) => l.employee_id === loggedEmployeeId);
  }

  if (loggedRole === "Manager") {
    const reportingIds = employees
      .filter(e => Number(e.reporting_manager_id) === Number(loggedEmployeeId))
      .map(e => Number(e.employee_id));
    filteredLeaves = filteredLeaves.filter((l) =>
      reportingIds.includes(Number(l.employee_id)) &&
      (l.approved_by === null || l.approved_by === undefined || Number(l.approved_by) === Number(loggedEmployeeId))
    );
  }

  if (employeeFilter) {
    filteredLeaves = filteredLeaves.filter((l) => l.employee_id === Number(employeeFilter));
  }

  if (statusFilter) {
    filteredLeaves = filteredLeaves.filter((l) => getStatus(l.status_id) === statusFilter);
  }

  // Remove date filter for employees
  if (selectedDate && loggedRole !== "Employee") {
    const date = new Date(selectedDate);
    filteredLeaves = filteredLeaves.filter((l) => {
      const start = new Date(l.start_date);
      const end = new Date(l.end_date);
      return date >= start && date <= end;
    });
  }

  // PAGINATION

  const totalPages = Math.max(1, Math.ceil(filteredLeaves.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paginatedLeaves = filteredLeaves.slice(start, start + pageSize);

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-body">

        <div className="text-muted small">Overview</div>
        <h5 className="mb-3">Leave List</h5>

        {/* FILTER SECTION */}

        <div className="row mb-3">

          {loggedRole !== "Employee" && (
            <div className="col-md-3">
              <label className="small text-muted">Employee</label>
              <select
                className="form-select form-select-sm"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
              >
                <option value="">All Employees</option>
                {(loggedRole === "Manager"
                  ? employees.filter(e => Number(e.reporting_manager_id) === Number(loggedEmployeeId))
                  : employees
                ).map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.employee_code} - {emp.first_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {loggedRole !== "Employee" && (
            <div className="col-md-3">
              <label className="small text-muted">Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          )}

          <div className="col-md-3">
            <label className="small text-muted">Status</label>
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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

        {/* TABLE */}

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr className="table-light text-uppercase small">
                <th>ID</th>
                <th>Employee</th>
                <th>Start</th>
                <th>End</th>
                <th className="text-center">Days</th>
                <th className="text-center">Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedLeaves.map((l) => (
                <tr key={l.leave_request_id}>
                  <td>{l.leave_request_id}</td>
                  <td>{getEmployee(l.employee_id)}</td>
                  <td>{l.start_date?.slice(0, 10)}</td>
                  <td>{l.end_date?.slice(0, 10)}</td>
                  <td className="text-center">{l.total_days}</td>

                  <td className="text-center">
                    <span className={getStatusBadge(l.status_id)}>
                      {getStatus(l.status_id)}
                    </span>
                  </td>

                  <td className="text-end">
                    {l.employee_id === loggedEmployeeId ? (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => cancelLeave(l.leave_request_id)}
                      >
                        Cancel
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-outline-secondary" disabled>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION */}

          {filteredLeaves.length > 0 && (
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                Showing {start + 1}-{Math.min(start + pageSize, filteredLeaves.length)} of {filteredLeaves.length}
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

export default LeaveList;
