require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// PORT 
const PORT = process.env.PORT;

//  ROUTES 
const authRoutes = require("./routes/authRoutes");
const roleRoutes = require("./routes/roleRoutes");
const employeeRoutes = require("./routes/employee.routes");
const salaryRoutes = require("./routes/salary.routes");
const departmentRoutes = require("./routes/department.routes");
const jobPositionRoutes = require("./routes/jobPosition.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const locationRoutes = require("./routes/location.routes");
const leaveRequestRoutes = require("./routes/leaveRequest.routes");
const companyRoutes = require("./routes/company.routes");
const masterDataRoutes = require("./routes/masterData.routes");
const dashboardRoutes  = require("./routes/dashboard.routes");

//  MIDDLEWARE 
const errorHandler = require("./middleware/error.middleware");

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// API ROUTES 
app.use("/api/auth",authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/salaries", salaryRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/job-positions", jobPositionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/leave", leaveRequestRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/master-data", masterDataRoutes);
app.use("/api/dashboard", dashboardRoutes);

//  ERROR HANDLER 
app.use(errorHandler);

//  START SERVER 
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});