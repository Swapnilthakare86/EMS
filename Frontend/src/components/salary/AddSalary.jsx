import { useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { validateSalary } from "../../utils/validation";
import axios from "axios";

function AddSalary({ employees, fetchSalaries }) {
  const emptyForm = {
    employee_id: "",
    basic_salary: "",
    deductions: "",
    start_date: "",
  };
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleEmployeeSelect = (selected) => {
    setFormData({ ...formData, employee_id: selected.value });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateSalary(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      await axios.post("http://localhost:3000/api/salaries", formData);
      alert("Salary added successfully");
      setFormData(emptyForm);
      setErrors({});
      if (fetchSalaries) fetchSalaries();
      navigate("/salary");
    } catch (err) {
      console.error(err);
      alert("Error submitting salary");
    }
  };

  const employeeOptions = employees.map((emp) => ({
    value: emp.employee_id,
    label: `${emp.employee_code} - ${emp.first_name} ${emp.last_name}`,
  }));

  return (
    <div className="container mt-5">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header bg-gradient-primary d-flex justify-content-between align-items-center rounded-top-4">
          <h5 className="mb-0">Add Salary</h5>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Employee</label>
                <Select
                  options={employeeOptions}
                  value={employeeOptions.find(
                    (e) => e.value === formData.employee_id
                  ) || null}
                  onChange={handleEmployeeSelect}
                  placeholder="Select Employee"
                  classNamePrefix="react-select"
                />
                {errors.employee_id && (
                  <small className="text-danger">{errors.employee_id}</small>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Basic Salary</label>
                <input
                  type="number"
                  className="form-control shadow-sm"
                  name="basic_salary"
                  value={formData.basic_salary}
                  onChange={handleChange}
                  placeholder="Enter basic salary"
                />
                {errors.basic_salary && (
                  <small className="text-danger">{errors.basic_salary}</small>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Deductions</label>
                <input
                  type="number"
                  className="form-control shadow-sm"
                  name="deductions"
                  value={formData.deductions}
                  onChange={handleChange}
                  placeholder="Enter deductions"
                />
                {errors.deductions && (
                  <small className="text-danger">{errors.deductions}</small>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Salary Date</label>
                <input
                  type="date"
                  className="form-control shadow-sm"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                />
                {errors.start_date && (
                  <small className="text-danger">{errors.start_date}</small>
                )}
              </div>

              <div className="col-12 d-flex justify-content-end mt-2">
                <button className="btn btn-success px-5 py-2 shadow-sm">
                  Add Salary
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddSalary;