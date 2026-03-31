import { useState } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import axiosClient from "../../api/axiosClient";

function ForgotPassword() {
	const navigate = useNavigate();
	const [login_id, setLoginId] = useState("");
	const [email, setEmail] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await axiosClient.post(
				"/auth/forgot-password",
				{ login_id, email }
			);
			alert("Reset link sent to email");
			setLoginId("");
			setEmail("");
			navigate("/login");
		} catch (err) {
			alert("Error sending email");
		}
	};

	return (
		<div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "600px" }}>
			<div className="card shadow-lg rounded-4 p-4" style={{ maxWidth: "400px", width: "80%", backgroundColor: "#fff" }}>
				<h4 className="text-center mb-4">Forgot Password</h4>

				<form onSubmit={handleSubmit}>
					<input
						className="form-control mb-3 rounded-3"
						placeholder="Employee Code / Username"
						value={login_id}
						onChange={(e) => setLoginId(e.target.value)}
						required
					/>

					<input
						type="email"
						className="form-control mb-4 rounded-3"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>

					<button type="submit" className="btn btn-warning w-100 rounded-3">
						Send Reset Link
					</button>
				</form>
			</div>
		</div>
	);
}

export default ForgotPassword;
