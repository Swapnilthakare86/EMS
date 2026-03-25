import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {

  const [loginId,setLoginId] = useState("");
  const [password,setPassword] = useState("");
  const [showPassword,setShowPassword] = useState(false);
  const [loading,setLoading] = useState(false);
  const [message,setMessage] = useState("");

  const navigate = useNavigate();

  const API = "http://localhost:3000/api";

  const roleMap = {
    1:"Admin",
    2:"HR",
    3:"Manager",
    4:"Employee"
  };


  /* LOGIN */

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);
    setMessage("");

    try{

      const res = await axios.post(
        `${API}/auth/login`,
        {
          login_id:loginId,
          password
        }
      );

      const roleId = res.data.user.role;
      const roleName = roleMap[roleId] || "Employee";

      const employeeId = res.data.user.employee_id;

      localStorage.setItem("token",res.data.token);
      localStorage.setItem("employee_name",res.data.user.username);
      localStorage.setItem("role",roleName);
      localStorage.setItem("employee_id",employeeId);

      setMessage("Login successful");

      setTimeout(()=>{

        const target =
          roleName === "Admin"
          ? "/admin"
          : "/dashboard";

        navigate(target);

      },500);

    }catch(err){

      setMessage(
        err.response?.data?.message ||
        "Login failed"
      );

    }

    setLoading(false);

  };


  return (

    <div
      className="container d-flex justify-content-center align-items-center"
      style={{minHeight:"600px"}}
    >

      <div
        className="card shadow-lg rounded-4 p-4"
        style={{maxWidth:"400px",width:"100%"}}
      >

        <div className="text-center mb-4">
          <h4 className="mb-0">Login</h4>
        </div>

        {message && (
          <div className="alert alert-info text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="mb-3">

            <label className="form-label">
              Employee Code / Username
            </label>

            <input
              type="text"
              className="form-control rounded-3"
              placeholder="Enter Employee Code or Username"
              value={loginId}
              onChange={(e)=>setLoginId(e.target.value)}
              required
            />

          </div>

          <div className="mb-3">

            <label className="form-label">
              Password
            </label>

            <div className="input-group">

              <input
                type={showPassword ? "text":"password"}
                className="form-control rounded-3"
                placeholder="Enter Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={()=>setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁"}
              </button>

            </div>

          </div>

          <button
            type="submit"
            className="btn btn-warning w-100 rounded-3"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}

          </button>

        </form>

        <div className="d-flex justify-content-between mt-3">

          <Link to="/forgot-password">
            Forgot Password?
          </Link>

          <Link to="/register">
            Register
          </Link>

        </div>

      </div>

    </div>

  );

}

export default Login;