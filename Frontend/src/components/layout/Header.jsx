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
    <nav className="navbar navbar-dark bg-dark px-3 fixed-top">

      <Link className="navbar-brand" to={name ? "/dashboard" : "/login"}>
        EMS
      </Link>

      <div className="ms-auto">
        {name ? (
          <div className="text-white">
            {name}
            <button
              className="btn btn-sm btn-danger ms-3"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <Link className="btn btn-sm btn-outline-light me-2" to="/login">
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