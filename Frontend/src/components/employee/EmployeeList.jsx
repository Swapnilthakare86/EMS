import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { InputGroup, Form, Button, Alert } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

function EmployeeList() {
	const navigate = useNavigate();
	const location = useLocation();
	const role = localStorage.getItem("role");

	const [employees, setEmployees] = useState([]);
	const [filteredEmployees, setFilteredEmployees] = useState([]);
	const [loading, setLoading] = useState(true);

	const [searchText, setSearchText] = useState("");
	const [message, setMessage] = useState("");
	const [msgType, setMsgType] = useState("success");

	const [selectedRoleFilter, setSelectedRoleFilter] = useState("All");
	const [onlyReporting, setOnlyReporting] = useState(false);
	const loggedManagerId = Number(localStorage.getItem("employee_id")) || null;

	const recordsPerPage = 10;
	const [currentPage, setCurrentPage] = useState(1);

	// ================= FETCH EMPLOYEES =================
	const fetchEmployees = (goLastPage = false) => {
		setLoading(true);
		axiosClient
			.get("/employees")
			.then((res) => {
				const data = res.data.data || res.data;
				if (Array.isArray(data)) {
					setEmployees(data);
					setFilteredEmployees(data);
					const totalPages = Math.ceil(data.length / recordsPerPage);
					setCurrentPage(goLastPage ? totalPages || 1 : 1);
				}
				setLoading(false);
			})
			.catch((err) => {
				console.error(err);
				setLoading(false);
			});
	};

	useEffect(() => {
		fetchEmployees(location.state?.goLastPage);
	}, []);

	// ================= SEARCH & ROLE FILTER =================
	useEffect(() => {
		let filtered = [...employees];

		if (role === "Manager" && onlyReporting) {
			filtered = filtered.filter(emp => Number(emp.reporting_manager_id) === Number(loggedManagerId));
		}

		if (selectedRoleFilter !== "All") {
			filtered = filtered.filter(emp => emp.role_name === selectedRoleFilter);
		}

		if (searchText) {
			const text = searchText.toLowerCase();
			filtered = filtered.filter(
				(emp) =>
					emp.employee_code?.toLowerCase().includes(text) ||
					emp.first_name?.toLowerCase().includes(text) ||
					emp.last_name?.toLowerCase().includes(text) ||
					emp.department_name?.toLowerCase().includes(text) ||
					emp.role_name?.toLowerCase().includes(text) ||
					emp.position_title?.toLowerCase().includes(text)
			);
		}

		setFilteredEmployees(filtered);
		setCurrentPage(1);
	}, [searchText, selectedRoleFilter, onlyReporting, employees]);

	// ================= DELETE =================
	const handleDelete = (id) => {
		if (!window.confirm("Delete this employee?")) return;
		axiosClient
			.delete(`/employees/${id}`)
			.then(() => {
				setMessage("Employee deleted successfully");
				setMsgType("success");
				fetchEmployees();
			})
			.catch(() => {
				setMessage("Delete failed");
				setMsgType("danger");
			});
	};

	const canUpdateEmployee = (currentRole, empRole) => {
		if (currentRole === "Admin") return true;
		if (currentRole === "HR") return empRole === "Employee";
		if (currentRole === "Manager") return empRole === "Employee" || empRole === "HR";
		return false;
	};

	// ================= PAGINATION =================
	const indexOfLastRecord = currentPage * recordsPerPage;
	const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
	const currentRecords = filteredEmployees.slice(indexOfFirstRecord, indexOfLastRecord);
	const totalPages = Math.ceil(filteredEmployees.length / recordsPerPage);
	const changePage = (pageNumber) => setCurrentPage(pageNumber);

	// ================= SUMMARY COUNTS =================
	const totalEmployees = employees.length;
	const totalAdmin = employees.filter((e) => e.role_name === "Admin").length;
	const totalHR = employees.filter((e) => e.role_name === "HR").length;
	const totalManager = employees.filter((e) => e.role_name === "Manager").length;
	const totalStaff = employees.filter((e) => e.role_name === "Employee").length;

	if (loading) return <div className="text-center mt-5">Loading...</div>;

	const summaryCards = [
		{ label: "All", count: totalEmployees, bg: "bg-primary text-white" },
		{ label: "Admin", count: totalAdmin, bg: "bg-warning text-dark" },
		{ label: "HR", count: totalHR, bg: "bg-info text-white" },
		{ label: "Manager", count: totalManager, bg: "bg-success text-white" },
		{ label: "Employee", count: totalStaff, bg: "bg-secondary text-white" },
	];

	return (
		<div className="container mt-4">

			{/* Header */}
			<div className="d-flex align-items-center mb-3">
				<div className="flex-shrink-0">
					<Button variant="outline-secondary" size="sm" onClick={() => navigate("/dashboard")}>
						← Dashboard
					</Button>
				</div>
				<div className="flex-grow-1 text-center">
					<h3 className="fw-bold mb-0">Employees Details</h3>
				</div>
				<div className="flex-shrink-0">
					{role !== "Employee" && (
						<Button variant="success" size="sm" onClick={() => navigate("/employees/create")}>
							+ Add Employee
						</Button>
					)}
				</div>
			</div>

			{/* Toast Message */}
			{message && (
				<Alert variant={msgType} dismissible onClose={() => setMessage("")} className="shadow-sm">
					{message}
				</Alert>
			)}

			{/* Summary Cards */}
			<div className="d-flex justify-content-center mb-4 flex-wrap gap-2">
				{summaryCards.map((card) => (
					<div
						key={card.label}
						className={`card text-center shadow-sm border-1 rounded-3 p-2 `}
						style={{
							width: "100px",
							cursor: "pointer",
							fontSize: "0.85rem",
						}}
						onClick={() => setSelectedRoleFilter(card.label)}
					>
						<h6 className="mb-1">{card.label}</h6>
						<h5 className="fw-bold mb-0">{card.count}</h5>
					</div>
				))}
			</div>

			{/* Search */}
			<div className="row justify-content-center mb-3">
				<div className="col-md-6">
					<InputGroup>
						<Form.Control
							type="text"
							placeholder="Search by Code, Name, Department..."
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							className="shadow-sm"
						/>
					</InputGroup>
				</div>
			</div>

			{role === "Manager" && (
				<div className="d-flex justify-content-center mb-3">
					<Form.Check
						type="checkbox"
						label="Only reporting employees to me"
						checked={onlyReporting}
						onChange={(e) => setOnlyReporting(e.target.checked)}
					/>
				</div>
			)}

			{/* Employee Table */}
			<div className="card shadow-lg border-0 rounded-4">
				<div className="card-body">
					<div className="table-responsive">
						<table className="table table-hover align-middle table-striped">
							<thead className="table-dark">
								<tr>
									<th>Emp Code</th>
									<th>Name</th>
									<th>Email</th>
									<th>Gender</th>
									<th>Phone</th>
									{role === "Admin" && <th>DOB</th>}
									<th>Hire Date</th>
									<th>Department</th>
									<th>Position</th>
									{role === "Admin" && <th>Role</th>}
									{role !== "Employee" && <th>Action</th>}
								</tr>
							</thead>
							<tbody>
								{currentRecords.length > 0 ? currentRecords.map(emp => (
									<tr key={emp.employee_id}>
										<td><span className="badge bg-primary">{emp.employee_code}</span></td>
										<td>{emp.first_name} {emp.last_name}</td>
										<td>{emp.email}</td>
										<td>{emp.gender}</td>
										<td>{emp.phone}</td>
										{role === "Admin" && <td>{emp.dob}</td>}
										<td>{emp.hire_date}</td>
										<td>{emp.department_name}</td>
										<td>{emp.position_title}</td>
										{role === "Admin" && <td>{emp.role_name}</td>}
										{role !== "Employee" && (
											<td>
												<div className="d-flex gap-2">
													{canUpdateEmployee(role, emp.role_name) && (
														<Button
															variant="warning"
															size="sm"
															onClick={() => navigate(`/employees/update/${emp.employee_id}`)}
														>
															Update
														</Button>
													)}
													{role === "Admin" && (
														<Button
															variant="danger"
															size="sm"
															onClick={() => handleDelete(emp.employee_id)}
														>
															Delete
														</Button>
													)}
												</div>
											</td>
										)}
									</tr>
								)) : (
									<tr>
										<td colSpan={role === "Admin" ? "11" : (role === "Employee" ? "7" : "8")} className="text-center text-muted">
											No employees found
										</td>
									</tr>
								)}
							</tbody>
						</table>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="d-flex justify-content-center mt-4">
								<ul className="pagination shadow-sm rounded-3">
									<li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
										<button className="page-link" onClick={() => changePage(currentPage - 1)}>«</button>
									</li>
									{[...Array(totalPages)].map((_, idx) => (
										<li key={idx} className={`page-item ${currentPage === idx + 1 ? "active" : ""}`}>
											<button className="page-link" onClick={() => changePage(idx + 1)}>{idx + 1}</button>
										</li>
									))}
									<li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
										<button className="page-link" onClick={() => changePage(currentPage + 1)}>»</button>
									</li>
								</ul>
							</div>
						)}

					</div>
				</div>
			</div>

		</div>
	);
}

export default EmployeeList;