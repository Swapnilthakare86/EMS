import { useEffect, useState } from "react";
import axios from "axios";
import ProfileCard from "../../components/dashboard/ProfileCard";
import { Link } from "react-router-dom";
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

function HRDashboard() {
  const [name, setName] = useState(localStorage.getItem("employee_name") || "HR");
  const [email, setEmail] = useState(localStorage.getItem("employee_email") || "");
  const [attendance, setAttendance] = useState({ total: 0, present: 0, absent: 0, onLeave: 0 });

  const empIdRaw = localStorage.getItem("employee_id");
  const empId = empIdRaw && empIdRaw !== "undefined" ? Number(empIdRaw) : null;

  useEffect(() => {
    const load = async () => {
      if (!empId) return;
      try {
        const res = await axios.get(`http://localhost:3000/api/employees/${empId}`);
        const emp = res.data?.data || res.data || {};
        if (emp.first_name || emp.last_name)
          setName(`${emp.first_name || ""} ${emp.last_name || ""}`.trim());
      } catch (e) { console.error(e); }
    };
    load();
  }, [empId]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const todayDay = new Date().getDay();
        const [empRes, attRes, leaveRes, statusRes] = await Promise.all([
          axios.get("http://localhost:3000/api/employees"),
          axios.get("http://localhost:3000/api/attendance"),
          axios.get("http://localhost:3000/api/leave"),
          axios.get("http://localhost:3000/api/master-data/category/leave_status")
        ]);
        const employees = empRes.data.data || empRes.data;
        const attData = attRes.data.data || attRes.data;
        const leaveData = leaveRes.data.data || leaveRes.data;
        const statuses = statusRes.data.data || statusRes.data;
        const approvedId = statuses.find(s => s.value === "Approved")?.master_data_id;
        let present = 0, onLeave = 0;
        if (todayDay !== 0 && todayDay !== 6) {
          employees.forEach(emp => {
            const hasLeave = leaveData.some(l => Number(l.employee_id) === Number(emp.employee_id) && l.status_id === approvedId && l.start_date <= today && l.end_date >= today);
            const hasAtt = attData.some(a => Number(a.employee_id) === Number(emp.employee_id) && a.attendance_date?.slice(0, 10) === today && a.check_in);
            if (hasLeave) onLeave++;
            else if (hasAtt) present++;
          });
        }
        setAttendance({ total: employees.length, present, absent: employees.length - present - onLeave, onLeave });
      } catch (err) { console.error(err); }
    };
    fetchSummary();
  }, []);

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
        { to: "/leaves/new", label: "Request", class: "btn-success" },
       
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
      desc: "Manage employee records",
      icon: <Users size={20} />,
      actions: [
        { to: "/employees", label: "Employees", class: "btn-outline-dark" },
        { to: "/attendance/all", label: "All Attendance", class: "btn-outline-primary" },
		 { to: "/employee-leave-list", label: "All Leaves", class: "btn-outline-info" }
      ]
    },
    {
      title: "Departments",
      desc: "Departments & job roles",
      icon: <Layers size={20} />,
      actions: [
        { to: "/job-positions", label: "Positions", class: "btn-outline-secondary" },
        { to: "/departments", label: "Departments", class: "btn-outline-secondary" }
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
          Welcome Back, <span className="text-gradient">{email || name}</span> 👋
        </h3>
      </div>

      <div className="row g-4">
        {/* PROFILE */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: "90px" }}>
            <ProfileCard />
          </div>
        </div>

        {/* DASHBOARD */}
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
                        <a key={i} href={btn.to} className={`btn btn-sm ${btn.class}`}>{btn.label}</a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUMMARY */}
        <div className="col-lg-2">
          <div className="sticky-top" style={{ top: "90px" }}>
            <div className="card shadow-sm">
              <div className="card-body p-2">
                <div className="text-muted text-center mb-2" style={{ fontSize: "0.72rem", fontWeight: 600 }}>TODAY</div>
                {[
                  { icon: <Users size={14} className="text-primary" />, label: "Total", value: attendance.total, color: "text-primary" },
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

export default HRDashboard;