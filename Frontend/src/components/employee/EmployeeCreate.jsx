import { useState, useEffect } from "react";
import axios from "axios";
import { validateEmployee } from "../../utils/validation";
import { useNavigate } from "react-router-dom";

function getFilteredRoles(allRoles) {
  const currentRole = localStorage.getItem("role");
  if (currentRole === "HR") return allRoles.filter(r => r.role_name === "Employee");
  if (currentRole === "Manager") return allRoles.filter(r => r.role_name === "Employee" || r.role_name === "HR");
  return allRoles;
}

function EmployeeCreate() {
  const navigate = useNavigate();

  const emptyForm = {
    employee_code: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    company_id: "",
    location_id: "",
    department_id: "",
    job_position_id: "",
    employment_type_id: "",
    reporting_manager_id: "",
    hire_date: "",
    role_id: ""
  };

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [types, setTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [managers, setManagers] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/api/companies").then(res => setCompanies(res.data.data || res.data || []));
    axios.get("http://localhost:3000/api/departments").then(res => setDepartments(res.data.data || res.data || []));
    axios.get("http://localhost:3000/api/job-positions").then(res => setPositions(res.data.data || res.data || []));
    axios.get("http://localhost:3000/api/master-data/category/employment_type").then(res => setTypes(res.data.data || res.data || []));
    axios.get("http://localhost:3000/api/employees/managers").then(res => setManagers(res.data.data || [])).catch(() => setManagers([]));
    axios.get("http://localhost:3000/api/roles").then(res => setRoles(res.data.data || res.data || []));
    axios.get("http://localhost:3000/api/employees/next-code").then(res => setFormData(prev => ({ ...prev, employee_code: res.data.nextCode }))).catch(() => setFormData(prev => ({ ...prev, employee_code: "EMP001" })));
  }, []);

  // Email live check
  useEffect(() => {
    const email = formData.email;
    if (!email || !/^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov|co|io|info|biz|me|us|uk|au|ca|de|fr|jp|cn|br|za)$/i.test(email)) {
      setEmailExists(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setCheckingEmail(true);
        const res = await axios.get(`http://localhost:3000/api/employees/check-email?email=${email}`);
        setEmailExists(res.data.exists);
        if (res.data.exists) setErrors(prev => ({ ...prev, email: "Email already exists" }));
        else setErrors(prev => { const n = { ...prev }; delete n.email; return n; });
      } catch (err) {
        console.error(err);
        setEmailExists(false);
      } finally {
        setCheckingEmail(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.email]);

  // Fetch locations when company changes
  useEffect(() => {
    if (!formData.company_id) return setLocations([]);
    axios.get(`http://localhost:3000/api/locations/company/${formData.company_id}`).then(res => setLocations(res.data.data || res.data || [])).catch(() => setLocations([]));
  }, [formData.company_id]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "first_name" || name === "last_name") value = value.replace(/[^a-zA-Z\s]/g, "");
    if (name === "phone") value = value.replace(/[^0-9]/g, "").slice(0, 10);
    if (name === "email") value = value.trim().toLowerCase();
    else value = value.trimStart();

    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);
    const validationErrors = validateEmployee({ ...updatedForm, emailExists }, true);
    setErrors(prev => ({ ...prev, [name]: validationErrors[name] || "" }));
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailExists) return setErrors(prev => ({ ...prev, email: "Email already exists" }));

    const validationErrors = validateEmployee({ ...formData, emailExists });
    if (Object.keys(validationErrors).length) return setErrors(validationErrors);

    setLoading(true);

    try {
      const payload = {
        ...formData,
        email: formData.email.toLowerCase(),
        company_id: Number(formData.company_id) || null,
        location_id: Number(formData.location_id) || null,
        department_id: Number(formData.department_id) || null,
        job_position_id: Number(formData.job_position_id) || null,
        employment_type_id: Number(formData.employment_type_id) || null,
        reporting_manager_id: Number(formData.reporting_manager_id) || null,
        role_id: Number(formData.role_id) || null
      };
      await axios.post("http://localhost:3000/api/employees", payload);
      showToast("Employee Created Successfully");
      setFormData(emptyForm);
      setErrors({});
      setTimeout(() => navigate("/employees", { state: { goLastPage: true } }), 1200);
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else showToast("Something went wrong", "danger");
    }

    setLoading(false);
  };

  return (
    <div className="container mt-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Add Employee</h3>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/employees")}>← Back</button>
      </div>

      {/* Toast */}
      {toast.show && <div className={`alert alert-${toast.type} position-fixed top-0 end-0 m-4 shadow`}>{toast.message}</div>}

      {/* Form Card */}
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">

              {/* Employee Code */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Employee Code</label>
                <input className="form-control shadow-sm" value={formData.employee_code} readOnly />
              </div>

              {/* First Name */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">First Name</label>
                <input
                  className={`form-control shadow-sm ${errors.first_name ? "is-invalid" : ""}`}
                  name="first_name"
                  value={formData.first_name}
                  placeholder="Enter First Name"
                  onChange={handleChange}
                />
                <div className="invalid-feedback">{errors.first_name}</div>
              </div>

              {/* Last Name */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Last Name</label>
                <input
                  className={`form-control shadow-sm ${errors.last_name ? "is-invalid" : ""}`}
                  name="last_name"
                  value={formData.last_name}
                  placeholder="Enter Last Name"
                  onChange={handleChange}
                />
                <div className="invalid-feedback">{errors.last_name}</div>
              </div>

              {/* Email */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className={`form-control shadow-sm ${errors.email || emailExists ? "is-invalid" : ""}`}
                  name="email"
                  value={formData.email}
                  placeholder="Enter Email"
                  onChange={handleChange}
                />
                {checkingEmail && <small className="text-muted">Checking...</small>}
                {!checkingEmail && emailExists && <small className="text-danger d-block">Email already exists</small>}
                {errors.email && !emailExists && <div className="invalid-feedback d-block">{errors.email}</div>}
              </div>

              {/* Phone */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Phone</label>
                <input
                  className={`form-control shadow-sm ${errors.phone ? "is-invalid" : ""}`}
                  name="phone"
                  value={formData.phone}
                  placeholder="Enter Phone"
                  onChange={handleChange}
                />
                <div className="invalid-feedback">{errors.phone}</div>
              </div>

              {/* DOB */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">DOB</label>
                <input
                  type="date"
                  className={`form-control shadow-sm ${errors.dob ? "is-invalid" : ""}`}
                  name="dob"
                  value={formData.dob}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={handleChange}
                />
                <div className="invalid-feedback">{errors.dob}</div>
              </div>

              {/* Gender */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Gender</label>
                <select className={`form-select shadow-sm ${errors.gender ? "is-invalid" : ""}`} name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <div className="invalid-feedback">{errors.gender}</div>
              </div>

              {/* Company */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Company</label>
                <select className={`form-select shadow-sm ${errors.company_id ? "is-invalid" : ""}`} name="company_id" value={formData.company_id} onChange={handleChange}>
                  <option value="">Select Company</option>
                  {companies.map(c => <option key={c.company_id} value={c.company_id}>{c.company_name}</option>)}
                </select>
                <div className="invalid-feedback">{errors.company_id}</div>
              </div>

              {/* Location */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Location</label>
                <select className={`form-select shadow-sm ${errors.location_id ? "is-invalid" : ""}`} name="location_id" value={formData.location_id} onChange={handleChange}>
                  <option value="">Select Location</option>
                  {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.location_name} ({l.city})</option>)}
                </select>
                <div className="invalid-feedback">{errors.location_id}</div>
              </div>

              {/* Department */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Department</label>
                <select className={`form-select shadow-sm ${errors.department_id ? "is-invalid" : ""}`} name="department_id" value={formData.department_id} onChange={handleChange}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                </select>
                <div className="invalid-feedback">{errors.department_id}</div>
              </div>

              {/* Job Position */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Job Position</label>
                <select className={`form-select shadow-sm ${errors.job_position_id ? "is-invalid" : ""}`} name="job_position_id" value={formData.job_position_id} onChange={handleChange}>
                  <option value="">Select Job</option>
                  {positions.map(p => <option key={p.job_position_id} value={p.job_position_id}>{p.position_title}</option>)}
                </select>
                <div className="invalid-feedback">{errors.job_position_id}</div>
              </div>

              {/* Employment Type */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Employment Type</label>
                <select className={`form-select shadow-sm ${errors.employment_type_id ? "is-invalid" : ""}`} name="employment_type_id" value={formData.employment_type_id} onChange={handleChange}>
                  <option value="">Select Type</option>
                  {types.map(t => <option key={t.master_data_id} value={t.master_data_id}>{t.value}</option>)}
                </select>
                <div className="invalid-feedback">{errors.employment_type_id}</div>
              </div>

              {/* Manager */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Reporting Manager</label>
                <select className="form-select shadow-sm" name="reporting_manager_id" value={formData.reporting_manager_id} onChange={handleChange}>
                  <option value="">Select Manager</option>
                  {managers.map(m => <option key={m.employee_id} value={m.employee_id}>{m.first_name} {m.last_name}</option>)}
                </select>
              </div>

              {/* Hire Date */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Hire Date</label>
                <input type="date" className={`form-control shadow-sm ${errors.hire_date ? "is-invalid" : ""}`} name="hire_date" value={formData.hire_date} onChange={handleChange} />
                <div className="invalid-feedback">{errors.hire_date}</div>
              </div>

              {/* Role */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Employment Role</label>
                <select className={`form-select shadow-sm ${errors.role_id ? "is-invalid" : ""}`} name="role_id" value={formData.role_id} onChange={handleChange}>
                  <option value="">Select Role</option>
                  {getFilteredRoles(roles).map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
                </select>
                <div className="invalid-feedback">{errors.role_id}</div>
              </div>

            </div>

            {/* Buttons */}
            <div className="text-end mt-4">
              <button type="button" className="btn btn-secondary me-2" onClick={() => navigate("/employees")}>Cancel</button>
              <button type="submit" className="btn btn-success" disabled={loading || emailExists || checkingEmail}>
                {loading ? "Saving..." : checkingEmail ? "Checking..." : "Add Employee"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default EmployeeCreate;