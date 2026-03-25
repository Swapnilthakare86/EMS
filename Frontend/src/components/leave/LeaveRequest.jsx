import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import LeaveList from "./LeaveList";
import { validateLeaveRequest } from "../../utils/validation";

function LeaveRequest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const emptyForm = {
    employee_id: "",
    leave_type_id: "",
    start_date: "",
    end_date: "",
    total_days: "",
    reason: "",
    status_id: "",
    applied_on: "",
    approved_by: ""
  };

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [managers, setManagers] = useState([]);
  const [listReload, setListReload] = useState(0);
  const [employeeDisplayName, setEmployeeDisplayName] = useState("");

  const isEdit = Boolean(id);

  const employeeId = Number(localStorage.getItem("employee_id"));
  const employeeName = localStorage.getItem("employee_name");

  // ================= INIT =================
  useEffect(() => {
    const init = async () => {
      setFormData(emptyForm);
      setErrors({});
      await fetchMasterData();
      if (isEdit) await fetchLeave();
    };
    init();
  }, [id]);

  // ================= FIX DEFAULT MANAGER AFTER LOAD =================
  useEffect(() => {
    if (employees.length && managers.length && !isEdit) {
      const me = employees.find(
        e => Number(e.employee_id) === Number(employeeId)
      );

      if (me?.reporting_manager_id) {
        setFormData(prev => ({
          ...prev,
          approved_by: String(me.reporting_manager_id) // ✅ FIX
        }));
      }
    }
  }, [employees, managers]);

  useEffect(() => {
    if (employees.length && formData.employee_id) {
      const emp = employees.find(
        e => Number(e.employee_id) === Number(formData.employee_id)
      );
      if (emp) {
        setEmployeeDisplayName(`${emp.first_name} ${emp.last_name}`);
      }
    }
  }, [employees, formData.employee_id]);

  // ================= FETCH =================

  const fetchMasterData = async () => {
    try {
      const [empRes, mgrRes, typeRes, statusRes] = await Promise.all([
        axios.get("http://localhost:3000/api/employees"),
        axios.get("http://localhost:3000/api/employees/managers").catch(() => ({ data: [] })),
        axios.get("http://localhost:3000/api/master-data/category/leave_type"),
        axios.get("http://localhost:3000/api/master-data/category/leave_status")
      ]);

      const empData = empRes.data.data || empRes.data;
      setEmployees(empData);

      // Managers
      const managersApi = mgrRes.data.data || mgrRes.data || [];
      const managersOnly = managersApi.length
        ? managersApi
        : empData.filter(e => Number(e.role_id) === 3);

      setManagers(managersOnly);

      setLeaveTypes(typeRes.data.data || typeRes.data);

      // Default employee & status only for new leave
      if (!isEdit) {
        const statuses = statusRes.data.data || statusRes.data;
        const pending = statuses.find(s => s.value === "Pending");
        setFormData(prev => ({
          ...prev,
          employee_id: employeeId,
          ...(pending ? { status_id: pending.master_data_id } : {})
        }));
      }

    } catch (err) {
      console.error(err);
      alert("Error fetching data");
    }
  };

  // ================= EDIT =================

  const fetchLeave = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/leave/${id}`);
      const data = res.data.data || res.data;

      setFormData({
        employee_id: data.employee_id,
        leave_type_id: data.leave_type_id,
        start_date: data.start_date?.slice(0, 10),
        end_date: data.end_date?.slice(0, 10),
        total_days: data.total_days,
        reason: data.reason,
        status_id: data.status_id,
        approved_by: String(data.approved_by || "")
      });

    } catch (err) {
      console.error(err);
      alert("Error fetching leave");
    }
  };

  // ================= HANDLERS =================

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleManagerSelect = async (e) => {
    const newManagerId = e.target.value;
    setFormData({ ...formData, approved_by: String(newManagerId) });
    if (newManagerId && employeeId) {
      try {
        await axios.patch(`http://localhost:3000/api/employees/${employeeId}/manager`, {
          reporting_manager_id: Number(newManagerId)
        });
      } catch (err) {
        console.error("Failed to update reporting manager", err);
      }
    }
  };

  const handleDateChange = e => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    if (updated.start_date && updated.end_date) {
      const diff =
        (new Date(updated.end_date) - new Date(updated.start_date)) /
          (1000 * 60 * 60 * 24) + 1;

      updated.total_days = diff > 0 ? diff : "";
    }

    setFormData(updated);
  };

  // ================= SUBMIT =================

  const handleSubmit = async e => {
    e.preventDefault();

    const validationErrors = validateLeaveRequest(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      const payload = {
        ...formData,
        employee_id: employeeId,
        approved_by: Number(formData.approved_by), // send number to backend
        total_days: Number(formData.total_days),
        applied_on: new Date().toISOString().slice(0, 10)
      };

      if (isEdit) {
        await axios.put(`http://localhost:3000/api/leave/${id}`, payload);
        alert("Leave Updated Successfully");
        setListReload(r => r + 1);
        navigate("/leaves/new");
      } else {
        await axios.post("http://localhost:3000/api/leave", payload);
        alert("Leave Request Sent");
        setListReload(r => r + 1);
        setFormData(emptyForm);
      }

    } catch (err) {
      console.error(err);
      alert("Error submitting leave");
    }
  };

  // ================= UI =================

  return (
    <div className="container py-4">

      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate("/dashboard")}
        >
          Back
        </button>
      </div>

      <div className="row g-4">

        {/* FORM */}
        <div className="col-lg-5">
          <div className="card shadow-sm">

            <div className="card-header">
              <h5>{isEdit ? "Edit Leave" : "Apply Leave"}</h5>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit} className="vstack gap-3">

                {/* Employee */}
                <div>
                  <label className="form-label fw-semibold">Employee</label>
                  <input
                    className="form-control"
                    value={employeeDisplayName || employeeName}
                    disabled
                  />
                </div>

                {/* Leave Type */}
                <div>
                  <label className="form-label fw-semibold">Leave Type</label>
                  <select
                    className={`form-select ${errors.leave_type_id ? "is-invalid" : ""}`}
                    name="leave_type_id"
                    value={formData.leave_type_id}
                    onChange={handleChange}
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map(l => (
                      <option key={l.master_data_id} value={l.master_data_id}>
                        {l.value}
                      </option>
                    ))}
                  </select>
                  {errors.leave_type_id && <div className="invalid-feedback">{errors.leave_type_id}</div>}
                </div>

                {/* Dates */}
                <div className="row">
                  <div className="col">
                    <label className="form-label fw-semibold">Start Date</label>
                    <input
                      type="date"
                      className={`form-control ${errors.start_date ? "is-invalid" : ""}`}
                      name="start_date"
                      value={formData.start_date}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={handleDateChange}
                    />
                    {errors.start_date && <div className="invalid-feedback">{errors.start_date}</div>}
                  </div>
                  <div className="col">
                    <label className="form-label fw-semibold">End Date</label>
                    <input
                      type="date"
                      className={`form-control ${errors.end_date ? "is-invalid" : ""}`}
                      name="end_date"
                      value={formData.end_date}
                      min={formData.start_date || new Date().toISOString().slice(0, 10)}
                      onChange={handleDateChange}
                    />
                    {errors.end_date && <div className="invalid-feedback">{errors.end_date}</div>}
                  </div>
                </div>

                <div>
                  <label className="form-label fw-semibold">Total Days</label>
                  <input
                    className="form-control"
                    value={formData.total_days}
                    readOnly
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="form-label fw-semibold">Reason</label>
                  <textarea
                    className={`form-control ${errors.reason ? "is-invalid" : ""}`}
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Enter reason"
                  />
                  {errors.reason && <div className="invalid-feedback">{errors.reason}</div>}
                </div>

                {/* Manager */}
                <div>
                  <label className="form-label fw-semibold">Reporting Manager</label>
                  <select
                    className={`form-select ${errors.approved_by ? "is-invalid" : ""}`}
                    value={String(formData.approved_by || "")}
                    onChange={handleManagerSelect}
                  >
                    <option value="">Select Manager</option>
                    {managers.map(m => (
                      <option key={m.employee_id} value={String(m.employee_id)}>
                        {m.first_name} {m.last_name}
                      </option>
                    ))}
                  </select>
                  {errors.approved_by && <div className="invalid-feedback">{errors.approved_by}</div>}
                </div>

                <button className="btn btn-success">
                  {isEdit ? "Update" : "Submit"}
                </button>

                {isEdit && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/leaves/new")}
                  >
                    Cancel
                  </button>
                )}

              </form>
            </div>
          </div>
        </div>

        {/* LIST */}
        <div className="col-lg-7">
          <LeaveList key={listReload} />
        </div>

      </div>
    </div>
  );
}

export default LeaveRequest;