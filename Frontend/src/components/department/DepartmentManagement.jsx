import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { validateDepartment } from "../../utils/validation";

function DepartmentManagement() {
  const emptyForm = { company_id: "", department_name: "" };
  const [departments, setDepartments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDepartments();
    fetchCompanies();
  }, []);

  const fetchDepartments = async () => {
    const res = await axios.get("http://localhost:3000/api/departments");
    setDepartments(res.data.data || res.data);
  };

  const fetchCompanies = async () => {
    const res = await axios.get("http://localhost:3000/api/companies");
    const companyList = res.data.data || res.data;
    setCompanies(companyList);

    // Auto-select based on logged-in user's company name
    const userCompanyName = localStorage.getItem("company_name");
    if (userCompanyName) {
      const matchedCompany = companyList.find(c => c.company_name === userCompanyName);
      if (matchedCompany) {
        setFormData(prev => ({ ...prev, company_id: matchedCompany.company_id }));
      }
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Department name validation: only letters and spaces
    if (name === "department_name") {
      value = value.replace(/[^a-zA-Z\s]/g, "").trimStart();
    }

    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateDepartment(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      if (editId) {
        await axios.put(`http://localhost:3000/api/departments/${editId}`, formData);
        alert("Department Updated");
      } else {
        await axios.post("http://localhost:3000/api/departments", formData);
        alert("Department Added");
      }
      setFormData(emptyForm);
      setEditId(null);
      fetchDepartments();
    } catch (err) {
      console.log(err);
      alert("Error saving department");
    }
  };

  const editDepartment = (dept) => {
    setFormData({ company_id: dept.company_id, department_name: dept.department_name });
    setEditId(dept.department_id);
    setErrors({});
  };

  const deleteDepartment = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    await axios.delete(`http://localhost:3000/api/departments/${id}`);
    fetchDepartments();
  };

  const getCompany = (id) => {
    const comp = companies.find((c) => c.company_id === id);
    return comp ? comp.company_name : id;
  };

  return (
    <div className="container mt-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Department Management</h4>
        <div className="d-flex gap-2">
          <Link to="/job-positions" className="btn btn-outline-secondary btn-sm">Manage Job Positions</Link>
          <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">Back to Dashboard</Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
        <div className="card text-center shadow-sm" style={{ width: "120px", cursor: "pointer" }}>
          <div className="card-body p-2">
            <div className="text-muted">Total Departments</div>
            <div className="fw-bold fs-5">{departments.length}</div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="card shadow-sm mb-4 rounded-4">
        <div className="card-header text-center">
          {editId ? "Update Department" : "Add Department"}
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">

              {/* Company Select */}
              <div className="col-md-6">
                <select
                  className={`form-select ${errors.company_id ? "is-invalid" : ""}`}
                  name="company_id"
                  value={formData.company_name}
                  onChange={handleChange}
                >
                  <option value="">Select Company</option>
                  {companies.map((c) => (
                    <option key={c.company_id} value={c.company_id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
                {errors.company_id && <div className="invalid-feedback">{errors.company_id}</div>}
              </div>


              {/* Department Name */}
              <div className="col-md-6">
                <input
                  type="text"
                  className={`form-control ${errors.department_name ? "is-invalid" : ""}`}
                  placeholder="Department Name"
                  name="department_name"
                  value={formData.department_name}
                  onChange={handleChange}
                />
                {errors.department_name && <div className="invalid-feedback">{errors.department_name}</div>}
              </div>

              {/* Buttons */}
              <div className="col-12 text-end">
                <button className="btn btn-success me-2">{editId ? "Update" : "Add"}</button>
                {editId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => { setFormData(emptyForm); setEditId(null); setErrors({}); }}
                  >
                    Cancel
                  </button>
                )}
              </div>

            </div>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm rounded-4">
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Company</th>
                <th>Department</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.department_id}>
                  <td>{d.department_id}</td>
                  <td>{getCompany(d.company_id)}</td>
                  <td>{d.department_name}</td>
                  <td>
                    <button className="btn btn-primary btn-sm me-2" onClick={() => editDepartment(d)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteDepartment(d.department_id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted">No departments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default DepartmentManagement;