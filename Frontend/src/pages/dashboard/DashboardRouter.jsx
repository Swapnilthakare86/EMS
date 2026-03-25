import AdminDashboard from "./AdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import HRDashboard from "./HRDashboard";
import ManagerDashboard from "./ManagerDashboard";

function DashboardRouter() {
  const role = localStorage.getItem("role") || "Employee";

  if (role === "Admin") return <AdminDashboard />;
  if (role === "HR") return <HRDashboard />;
  if (role === "Manager") return <ManagerDashboard />;
  if (role === "Employee")return <EmployeeDashboard />;
}

export default DashboardRouter;
