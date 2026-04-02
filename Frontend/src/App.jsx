import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Attendance from "./components/attendance/Attendance";
import AttendanceAll from "./components/attendance/AttendanceAll";
import LeaveRequest from "./components/leave/LeaveRequest";
import Salary from "./components/salary/Salary";
import ManagerApprovalPage from "./pages/ManagerApprovalPage";
import EmployeeList from "./components/employee/EmployeeList";
import EmployeeCreate from "./components/employee/EmployeeCreate";
import EmployeeUpdate from "./components/employee/EmployeeUpdate";
import DepartmentManagement from "./components/department/DepartmentManagement";
import JobPosition from "./components/department/JobPosition";
import LocationManagement from "./components/location/LocationManagement";
import CompanyManagement from "./components/company/CompanyManagement";
import LeaveListPage from "./pages/LeaveListPage";
import EmployeeLeaveList from "./components/leave/EmployeeLeaveList";
import AddSalaryPage from "./pages/salary/AddSalaryPage";
import Reports from "./components/reports/Reports";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import AdminDashboard from "./pages/dashboard/AdminDashboard";
import DashboardRouter from "./pages/dashboard/DashboardRouter";

function App() {
  console.log("App.jsx: render");

  return (
    <BrowserRouter>
      <Header />

      <main className="app-shell">
        <Routes>
          <Route
            path="/"
            element={
              localStorage.getItem("token")
                ? <Navigate to={localStorage.getItem("role") === "Admin" ? "/admin" : "/dashboard"} replace />
                : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute roles={["Admin","HR","Manager","Employee"]}>
                <Attendance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance/all"
            element={
              <ProtectedRoute roles={["Admin","HR","Manager"]}>
                <AttendanceAll />
              </ProtectedRoute>
            }
          />

          
          <Route
            path="/manager-approval"
            element={
              <ProtectedRoute roles={["Manager","Admin"]}>
                <ManagerApprovalPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaves/new"
            element={
              <ProtectedRoute>
                <LeaveRequest />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaves/:id"
            element={
              <ProtectedRoute>
                <LeaveRequest />
              </ProtectedRoute>
            }
          />

          <Route
            path="/salary"
            element={
              <ProtectedRoute roles={["Admin","HR","Manager","Employee"]}>
                <Salary />
              </ProtectedRoute>
            }
          />

          <Route
            path="/salary/add"
            element={
              <ProtectedRoute roles={["Admin","HR","Manager"]}>
                <AddSalaryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees"
            element={
              <ProtectedRoute roles={["Admin","HR","Manager","Employee"]}>
                <EmployeeList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees/create"
            element={
              <ProtectedRoute roles={["Admin","HR","Manager"]}>
                <EmployeeCreate />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees/update/:id"
            element={
              <ProtectedRoute roles={["Admin","HR","Manager"]}>
                <EmployeeUpdate />
              </ProtectedRoute>
            }
          />

          <Route
            path="/departments"
            element={
              <ProtectedRoute roles={["Admin","HR","Manager"]}>
                <DepartmentManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/job-positions"
            element={
              <ProtectedRoute roles={["Admin","HR","Manager"]}>
                <JobPosition />
              </ProtectedRoute>
            }
          />

          <Route
            path="/locations"
            element={
              <ProtectedRoute roles={["Admin","HR"]}>
                <LocationManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/companies"
            element={
              <ProtectedRoute roles={["Admin","HR"]}>
                <CompanyManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leave-list"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <LeaveListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee-leave-list"
            element={
              <ProtectedRoute roles={["Admin","HR","Manager"]}>
                <EmployeeLeaveList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute roles={["Admin", "HR"]}>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
