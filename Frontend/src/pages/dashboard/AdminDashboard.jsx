import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { Link, useNavigate } from "react-router-dom";
import ProfileCard from "../../components/dashboard/ProfileCard";
import { todayUTC } from "../../utils/timeUtils";
import {
  Calendar,
  FileText,
  IndianRupee,
  Users,
  Layers,
  UserCheck,
  UserX,
  ClipboardList,
  BarChart2
} from "lucide-react";
import "./dashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [name, setName] = useState(
    localStorage.getItem("employee_name") || "Admin"
  );

  const empIdRaw = localStorage.getItem("employee_id");
  const empId =
    empIdRaw && empIdRaw !== "undefined" ? Number(empIdRaw) : null;

  // Summary stats
  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    positions: 0,
    companies: 0
  });

  const [attendance, setAttendance] = useState({ present: 0, absent: 0, onLeave: 0 });

  // Redirect if not logged in
  useEffect(() => {
    if (!empId) {
      navigate("/login");
      return;
    }
  }, [empId, navigate]);

  // Load Name
  useEffect(() => {
    const load = async () => {
      if (!empId) return;
      try {
        const res = await axiosClient.get(`/employees/${empId}`);
        const emp = res.data?.data || res.data || {};
        if (emp.first_name) {
          setName(emp.first_name);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [empId]);

  // Fetch Dashboard Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [emp, dept, pos, comp] = await Promise.all([
          axiosClient.get("/employees"),
          axiosClient.get("/departments"),
          axiosClient.get("/job-positions"),
          axiosClient.get("/companies")
        ]);

        setStats({
          employees: (emp.data.data || emp.data).length,
          departments: (dept.data.data || dept.data).length,
          positions: (pos.data.data || pos.data).length,
          companies: (comp.data.data || comp.data).length
        });

        const today = todayUTC();
        const todayDay = new Date().getDay();
        const employees = emp.data.data || emp.data;
        const attList = (await axiosClient.get("/attendance")).data;
        const leaveList = (await axiosClient.get("/leave")).data;
        const leaveStatuses = (await axiosClient.get("/master-data/category/leave_status")).data;
        const statuses = leaveStatuses.data || leaveStatuses;
        const approvedId = statuses.find(s => s.value === "Approved")?.master_data_id;
        const attData = attList.data || attList;
        const leaveData = leaveList.data || leaveList;

        if (todayDay !== 0 && todayDay !== 6) {
          let present = 0, onLeave = 0;
          employees.forEach(emp => {
            const hasAtt = attData.some(a =>
              Number(a.employee_id) === Number(emp.employee_id) &&
              a.attendance_date?.slice(0, 10) === today &&
              a.check_in
            );
            const hasLeave = leaveData.some(l =>
              Number(l.employee_id) === Number(emp.employee_id) &&
              l.status_id === approvedId &&
              l.start_date <= today &&
              l.end_date >= today
            );
            if (hasLeave) onLeave++;
            else if (hasAtt) present++;
          });
          setAttendance({ present, absent: employees.length - present - onLeave, onLeave });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  // Navigation Cards
  const cards = [
    {
      title: "Attendance",
      desc: "View attendance & calendar",
      icon: <Calendar size={20} />,
      actions: [
        { to: "/attendance#calendar-only", label: "View", class: "btn-primary" }
      ]
    },
    {
      title: "Leave Requests",
      desc: "Manage employee leaves",
      icon: <FileText size={20} />,
      actions: [
        
        { to: "/employee-leave-list", label: "All Leaves", class: "btn-outline-info" },
      ]
    },
    {
      title: "Salary",
      desc: "Manage payroll & payslips",
      icon: <IndianRupee size={20} />,
      actions: [
        { to: "/salary", label: "View", class: "btn-outline-primary" },
        { to: "/salary/add", label: "Add", class: "btn-outline-success" }
      ]
    },
    {
      title: "Employees",
      desc: "Manage employee & attendance",
      icon: <Users size={20} />,
      actions: [
        { to: "/employees", label: "Employees", class: "btn-outline-dark" },
        { to: "/attendance/all", label: "Attendance", class: "btn-outline-primary" }
      ]
    },
    {
      title: "Departments",
      desc: "Manage departments & positions",
      icon: <Layers size={20} />,
      actions: [
        { to: "/job-positions", label: "Positions", class: "btn-outline-secondary" },
        { to: "/departments", label: "Departments", class: "btn-outline-secondary" }
      ]
    },
    {
      title: "Companies & Locations",
      desc: "Manage company & office",
      icon: <Layers size={20} />,
      actions: [
        { to: "/companies", label: "Companies", class: "btn-outline-secondary" },
        { to: "/locations", label: "Locations", class: "btn-outline-secondary" }
      ]
    },
    {
      title: "Reports",
      desc: "Export salary, attendance, leave & employee data",
      icon: <BarChart2 size={20} />,
      actions: [
        { to: "/reports", label: "Export Reports", class: "btn-outline-danger" }
      ]
    }
  ];

  return (
    <div className="dashboard-container container py-4">

      {/* HEADER */}
      <div className="dashboard-header mb-4">
        <h3 className="fw-bold">
          Welcome Back, <span className="text-gradient">{name}</span> 👋
        </h3>
      </div>

      {/* MAIN ROW */}
      <div className="row g-4">

        {/* PROFILE */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: "90px" }}>
            <ProfileCard />
          </div>
        </div>

        {/* NAVIGATION CARDS */}
        <div className="col-lg-6">
          <div className="row g-4">
            {cards.map((card, index) => (
              <div className="col-md-6" key={index}>
                <div className="card dashboard-card h-100">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <div className="card-icon">{card.icon}</div>
                      <div className="card-title mt-3">{card.title}</div>
                      <div className="card-desc">{card.desc}</div>
                    </div>
                    <div className="d-flex flex-wrap gap-2 mt-3">
                      {card.actions.map((btn, i) => (
                        <Link key={i} to={btn.to} className={`btn btn-sm ${btn.class}`}>
                          {btn.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ATTENDANCE SUMMARY - compact vertical right */}
        <div className="col-lg-2">
          <div className="sticky-top" style={{ top: "90px" }}>
            <div className="card shadow-sm">
              <div className="card-body p-2">
                <div className="text-muted text-center mb-2" style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.5px" }}>TODAY</div>
                {[
                  { icon: <Users size={14} className="text-primary" />, label: "Total", value: stats.employees, color: "text-primary" },
                  { icon: <UserCheck size={14} className="text-success" />, label: "Present", value: attendance.present, color: "text-success" },
                  { icon: <UserX size={14} className="text-danger" />, label: "Absent", value: attendance.absent, color: "text-danger" },
                  { icon: <ClipboardList size={14} className="text-warning" />, label: "On Leave", value: attendance.onLeave, color: "text-warning" }
                ].map((item, i) => (
                  <div key={i} className="d-flex align-items-center justify-content-between py-1 px-1 border-bottom">
                    <div className="d-flex align-items-center gap-1">
                      {item.icon}
                      <span style={{ fontSize: "0.72rem" }} className="text-muted">{item.label}</span>
                    </div>
                    <span className={`fw-bold ${item.color}`} style={{ fontSize: "0.8rem" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;
