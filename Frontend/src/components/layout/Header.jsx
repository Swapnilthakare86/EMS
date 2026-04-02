import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

function Header() {

  const navigate = useNavigate();
  const name = localStorage.getItem("employee_name");

  const logout = async () => {
    const employee_id = localStorage.getItem("employee_id");
    try {
      await axiosClient.post("/auth/logout", { employee_id: Number(employee_id) });
    } catch (err) {
      console.log("Logout error:", err);
    }
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-dark bg-dark fixed-top app-navbar">
      <div className="container-fluid app-navbar-inner">
        <Link className="navbar-brand app-navbar-brand" to={name ? "/dashboard" : "/login"}>
          EMS
        </Link>
        {name ? (
          <div className="app-navbar-user text-white">
            <span className="app-navbar-user-name">{name}</span>
            <button
              className="btn btn-sm btn-danger"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="app-navbar-auth">
            <Link className="btn btn-sm btn-outline-light" to="/login">
              Login
            </Link>
            <Link className="btn btn-sm btn-outline-light" to="/register">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;
