import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function ManagerApproval() {

  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [statusFilter, setStatusFilter] = useState(""); // NEW
  const loggedManagerId = Number(localStorage.getItem("employee_id")) || null;

  // ================= FETCH DATA =================
  useEffect(() => {
    fetchAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllData = async () => {

    const [leaveRes, empRes, statusRes, typeRes] = await Promise.all([
      axios.get("http://localhost:3000/api/leave"),
      axios.get("http://localhost:3000/api/employees"),
      axios.get("http://localhost:3000/api/master-data/category/leave_status"),
      axios.get("http://localhost:3000/api/master-data/category/leave_type")
    ]);

    const employeesData = empRes.data.data || empRes.data;

    setEmployees(employeesData);
    setLeaves(leaveRes.data.data || leaveRes.data);
    setStatuses(statusRes.data.data || statusRes.data);
    setLeaveTypes(typeRes.data.data || typeRes.data);
  };


  // ================= HELPER FUNCTIONS =================

  const getEmployeeName = (id) => {
    const emp = employees.find(e => e.employee_id === id);
    return emp ? `${emp.employee_code} - ${emp.first_name} ${emp.last_name}` : id;
  };

  const getLeaveTypeName = (id) => {
    const lt = leaveTypes.find(l => l.master_data_id === id);
    return lt ? lt.value : id;
  };

  const getStatusName = (id) => {
    const st = statuses.find(s => s.master_data_id === id);
    return st ? st.value : id;
  };


  // ================= FILTER LEAVES =================

  // Leaves assigned to this manager via approved_by, OR pending leaves from reporting employees
  const reportingEmployeeIds = employees
    .filter(e => Number(e.reporting_manager_id) === Number(loggedManagerId))
    .map(e => Number(e.employee_id));

  let filteredLeaves = leaves.filter(l =>
    Number(l.approved_by) === Number(loggedManagerId) ||
    (reportingEmployeeIds.includes(Number(l.employee_id)) && (l.approved_by === null || l.approved_by === undefined))
  );

  if (statusFilter) {
    filteredLeaves = filteredLeaves.filter(
      l => getStatusName(l.status_id) === statusFilter
    );
  }


  // ================= COUNT SUMMARY =================

  const myLeaves = leaves.filter(l =>
    Number(l.approved_by) === Number(loggedManagerId) ||
    (reportingEmployeeIds.includes(Number(l.employee_id)) && (l.approved_by === null || l.approved_by === undefined))
  );

  const pendingCount = myLeaves.filter(l => getStatusName(l.status_id) === "Pending").length;
  const approvedCount = myLeaves.filter(l => getStatusName(l.status_id) === "Approved").length;
  const rejectedCount = myLeaves.filter(l => getStatusName(l.status_id) === "Rejected").length;


  // ================= UPDATE STATUS =================

  const handleStatusChange = async (leaveId, statusId) => {

    if (!loggedManagerId) {
      alert("Missing manager id for approval");
      return;
    }

    await axios.put(
      `http://localhost:3000/api/leave/status/${leaveId}`,
      {
        status_id: Number(statusId),
        approved_by: Number(loggedManagerId)
      }
    );

    fetchAllData();
  };


  // ================= UI =================

  return (

    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Manager Leave Approval</h3>
        <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">Back to Dashboard</Link>
      </div>

      {/* ===== SUMMARY CARDS ===== */}

      <div className="row mb-3">

        <div className="col-md-3">

          <div
            className="card text-center border-warning shadow-sm"
            style={{cursor:"pointer"}}
            onClick={()=>setStatusFilter("Pending")}
          >

            <div className="card-body">
              <h6 className="text-warning">Pending Leaves</h6>
              <h4>{pendingCount}</h4>
            </div>

          </div>

        </div>


        <div className="col-md-3">

          <div
            className="card text-center border-success shadow-sm"
            style={{cursor:"pointer"}}
            onClick={()=>setStatusFilter("Approved")}
          >

            <div className="card-body">
              <h6 className="text-success">Approved Leaves</h6>
              <h4>{approvedCount}</h4>
            </div>

          </div>

        </div>


        <div className="col-md-3">

          <div
            className="card text-center border-danger shadow-sm"
            style={{cursor:"pointer"}}
            onClick={()=>setStatusFilter("Rejected")}
          >

            <div className="card-body">
              <h6 className="text-danger">Rejected Leaves</h6>
              <h4>{rejectedCount}</h4>
            </div>

          </div>

        </div>


        <div className="col-md-3 d-flex align-items-center">

          <button
            className="btn btn-secondary w-100"
            onClick={()=>setStatusFilter("")}
          >
            Show All
          </button>

        </div>

      </div>


      {/* ===== TABLE ===== */}

      <table className="table table-bordered table-striped shadow-sm">

        <thead className="table-dark">

          <tr>
            <th>Employee</th>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Total Days</th>
            <th>Reason</th>
            <th>Status</th>
          </tr>

        </thead>

        <tbody>

          {filteredLeaves.map(l => (

            <tr key={l.leave_request_id}>

              <td>{getEmployeeName(l.employee_id)}</td>
              <td>{getLeaveTypeName(l.leave_type_id)}</td>
              <td>{l.start_date}</td>
              <td>{l.end_date}</td>
              <td>{l.total_days}</td>
              <td>{l.reason}</td>

              <td>

                <select
                  className="form-select"
                  value={l.status_id || ""}
                  onChange={(e)=>handleStatusChange(l.leave_request_id, e.target.value)}
                >

                  {statuses.map(s => (
                    <option key={s.master_data_id} value={s.master_data_id}>
                      {s.value}
                    </option>
                  ))}

                </select>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}

export default ManagerApproval;
