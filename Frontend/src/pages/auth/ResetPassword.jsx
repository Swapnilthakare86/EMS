import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword() {

  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [validToken, setValidToken] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const verifyToken = async () => {

      try {

        await axios.get(
          `http://localhost:3000/api/auth/verify-reset-token/${token}`
        );

        setValidToken(true);

      } catch (err) {

        setValidToken(false);

      }

    };

    verifyToken();

  }, [token]);


  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);

    try {

      await axios.post(
        "http://localhost:3000/api/auth/reset-password",
        { token, password }
      );

      alert("Password updated successfully");

      navigate("/login");

    } catch (err) {

      alert(err.response?.data?.message);

    }

    setLoading(false);

  };


  if (!validToken) {

    return (
      <div className="container text-center mt-5">
        <h4 className="text-danger">
          Reset link expired. Please request a new one.
        </h4>
      </div>
    );

  }

  return (

    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "600px" }}>
      <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>

        <h4 className="text-center mb-4">Reset Password</h4>

        <form onSubmit={handleSubmit}>

          <input
            type="password"
            className="form-control mb-3"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn btn-warning w-100" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>

        </form>

      </div>
    </div>

  );

}

export default ResetPassword;