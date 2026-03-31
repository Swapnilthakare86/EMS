import { useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

function Register() {
	const [form, setForm] = useState({
		employee_id: "",
		employee_code: "",
		first_name: "",
		last_name: "",
		username: "",
		password: ""
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false); 

	const handleEmployeeCode = async (e) => {
		const code = e.target.value.toUpperCase();
		setForm(prev => ({
			...prev,
			employee_code: code,
			employee_id: "",
			first_name: "",
			last_name: "",
			username: ""
		}));
		setError("");
		try {
			const res = await axiosClient.get(`/employees/code/${code}`);
			setForm(prev => ({
				...prev,
				employee_id: res.data.employee_id,
				first_name: res.data.first_name,
				last_name: res.data.last_name,
				username: res.data.email
			}));
		} catch (err) {
			setError("Employee Code not generated");
		}
	};

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await axiosClient.post("/auth/register", {
				employee_id: form.employee_id,
				employee_code: form.employee_code,
				username: form.username,
				password: form.password
			});
			alert("User registered successfully");
			setForm({
				employee_id: "",
				employee_code: "",
				first_name: "",
				last_name: "",
				username: "",
				password: ""
			});
		} catch (err) {
			alert(err.response?.data?.message || "Registration failed");
		}
		setLoading(false);
	};

	return (
		<div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "600px" }}>
			<div className="card shadow-lg rounded-4 p-4" style={{ maxWidth: "450px", width: "100%", backgroundColor: "#fff" }}>
				<div className="text-center mb-4">
					<h4 className="mb-0">Register</h4>
				</div>

				<form onSubmit={handleSubmit}>
					<div className="mb-3">
						<label className="form-label">Employee Code</label>
						<input
							name="employee_code"
							className="form-control rounded-3"
							placeholder="Enter Employee Code"
							value={form.employee_code}
							onChange={handleEmployeeCode}
							required
						/>
						{error && <small className="text-danger">{error}</small>}
					</div>

					<div className="mb-3">
						<label className="form-label">Name</label>
						<input
							className="form-control rounded-3"
							value={`${form.first_name} ${form.last_name}`}
							readOnly
						/>
					</div>

					<div className="mb-3">
						<label className="form-label">Username (Email)</label>
						<input
							name="username"
							className="form-control rounded-3"
							value={form.username}
							readOnly
						/>
					</div>

					<div className="mb-3">
						<label className="form-label">Password</label>
						<div className="input-group">
							<input
								type={showPassword ? "text" : "password"}
								name="password"
								className="form-control rounded-3"
								placeholder="Enter Password"
								value={form.password}
								onChange={handleChange}
								required
							/>
							<button
								type="button"
								className="btn btn-outline-secondary rounded-3"
								onClick={() => setShowPassword(!showPassword)}
							>
								<i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
							</button>
						</div>
					</div>

					<button
						type="submit"
						className="btn btn-success w-100 rounded-3"
						disabled={loading || error || !form.employee_id}
					>
						{loading ? "Registering..." : "Register"}
					</button>
				</form>

				<div className="text-center mt-3">
					Already have an account? <Link to="/login">Login</Link>
				</div>
			</div>
		</div>
	);
}

export default Register;
