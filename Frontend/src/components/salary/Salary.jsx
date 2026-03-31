import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { Link, useNavigate } from "react-router-dom";

function Salary() {
  const [employees, setEmployees] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const role = localStorage.getItem("role");
  const isViewOnly = role === "Employee" || role === "Manager";
  const isAdminOrHR = ["Admin", "HR"].includes(role);

  const empIdRaw = localStorage.getItem("employee_id");
  const empId = empIdRaw && empIdRaw !== "undefined" ? Number(empIdRaw) : null;
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
    fetchSalaries();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axiosClient.get("/employees");
      setEmployees(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSalaries = async () => {
    try {
      const res = await axiosClient.get("/salaries");
      setSalaries(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this salary?")) return;
    try {
      await axiosClient.delete(`/salaries/${id}`);
      fetchSalaries();
    } catch (err) {
      console.error(err);
      alert("Error deleting salary");
    }
  };

  const getEmployeeName = (id) => {
    const emp = employees.find((e) => e.employee_id === id);
    return emp ? `${emp.employee_code} - ${emp.first_name} ${emp.last_name}` : id;
  };

  let filteredSalaries = salaries;

  if (isViewOnly && empId) {
    filteredSalaries = filteredSalaries.filter(
      (s) => Number(s.employee_id) === Number(empId)
    );
  }

  filteredSalaries = filteredSalaries.filter((s) => {
    const emp = employees.find((e) => e.employee_id === s.employee_id);
    const empName = emp ? `${emp.first_name} ${emp.last_name}`.toLowerCase() : "";
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch = !search || empName.includes(search);
    const matchesMonth = !monthFilter || (s.start_date && s.start_date.slice(0, 7) === monthFilter);
    return matchesSearch && matchesMonth;
  });

  const uniqueMonths = Array.from(
    new Set(salaries.map((s) => s.start_date && s.start_date.slice(0, 7)).filter(Boolean))
  ).sort().reverse();

  const totalPages = Math.ceil(filteredSalaries.length / itemsPerPage);
  const currentSalaries = filteredSalaries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">Salary Management</h4>
        <div>
          <Link to="/dashboard" className="btn btn-outline-secondary btn-sm me-2">
            Back to Dashboard
          </Link>
          {isAdminOrHR && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/salary/add")}>
              Add Salary
            </button>
          )}
        </div>
      </div>

      <div className="row g-2 mb-3">
        {isAdminOrHR && (
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search by Employee Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
        {isAdminOrHR && (
          <div className="col-md-4">
            <select
              className="form-control"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            >
              <option value="">All Months</option>
              {uniqueMonths.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {currentSalaries.length === 0 ? (
            <p className="text-muted p-3 mb-0">No salaries found</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-uppercase small">
                  <tr>
                    <th>Employee</th>
                    <th>Basic Salary</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                    <th>Salary Date</th>
                    {isAdminOrHR && <th className="text-end">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {currentSalaries.map((s) => (
                    <tr key={s.salary_id}>
                      <td>{getEmployeeName(s.employee_id)}</td>
                      <td>₹ {s.basic_salary}</td>
                      <td>₹ {s.deductions}</td>
                      <td>₹ {s.basic_salary - s.deductions}</td>
                      <td>{s.start_date?.slice(0, 10) || "-"}</td>
                      {isAdminOrHR && (
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => navigate(`/salary/add?edit=${s.salary_id}`)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(s.salary_id)}
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <nav className="mt-3">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 && "disabled"}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li key={page} className={`page-item ${page === currentPage && "active"}`}>
                <button className="page-link" onClick={() => handlePageChange(page)}>{page}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages && "disabled"}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default Salary;
