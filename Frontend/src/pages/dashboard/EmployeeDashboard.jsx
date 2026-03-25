import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ProfileCard from "../../components/dashboard/ProfileCard";
import {
  Calendar,
  FileText,
  IndianRupee,
  Users,
  UserCheck,
  UserX,
  ClipboardList
} from "lucide-react";
import "./dashboard.css";

function EmployeeDashboard() {
  const [presentToday, setPresentToday] = useState(false);
  const [onLeaveToday, setOnLeaveToday] = useState(false);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [workingHours, setWorkingHours] = useState("-");
  const [checkInTime, setCheckInTime] = useState(null); // "HH:MM:SS" from DB
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [message, setMessage] = useState("");

  const [name, setName] = useState(
    localStorage.getItem("employee_name") || "Employee"
  );

  const empIdRaw = localStorage.getItem("employee_id");
  const empId =
    empIdRaw && empIdRaw !== "undefined" ? Number(empIdRaw) : null;

  useEffect(() => {
    if (!empId) return;
    fetchDashboard();
  }, [empId]);

  // Live ticker: always calculates check_in → current system time, updates every second
  useEffect(() => {
    if (!checkInTime) return;
    const tick = () => {
      const now = new Date();
      const [h, m, s] = checkInTime.split(":").map(Number);
      const start = new Date(now);
      start.setHours(h, m, s, 0);
      const diffSec = Math.max(0, Math.floor((now - start) / 1000));
      const hh = Math.floor(diffSec / 3600);
      const mm = Math.floor((diffSec % 3600) / 60);
      const ss = diffSec % 60;
      setWorkingHours(
        `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [checkInTime]);

  const fetchDashboard = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);

      const attPromise = axios.get("http://localhost:3000/api/attendance");
      const empPromise = axios.get(
        `http://localhost:3000/api/employees/${empId}`
      );
      const leavePromise = axios
        .get(`http://localhost:3000/api/leave/employee/${empId}`)
        .catch((err) => {
          if (err.response?.status === 404) return { data: [] };
          throw err;
        });

      const [attRes, leaveRes, empRes, allEmpRes] = await Promise.all([
        attPromise,
        leavePromise,
        empPromise,
        axios.get("http://localhost:3000/api/employees")
      ]);

      const attendance = attRes.data.data || attRes.data || [];
      const leaves = leaveRes.data || [];
      const emp = empRes.data?.data || empRes.data || {};
      const allEmps = allEmpRes.data.data || allEmpRes.data || [];
      setTotalEmployees(allEmps.length);

      if (emp.first_name || emp.last_name) {
        setName(`${emp.first_name || ""} ${emp.last_name || ""}`.trim());
      }

      const myToday = attendance.find(
        (a) => Number(a.employee_id) === Number(empId) && a.attendance_date?.slice(0, 10) === today
      );

      setPresentToday(!!(myToday?.check_in));

      if (myToday?.check_in) {
        setCheckInTime(myToday.check_in); // triggers live ticker
      } else {
        setCheckInTime(null);
        setWorkingHours("-");
      }

      const onLeave = leaves.some(
        (l) =>
          l.status_id === 1 &&
          l.start_date <= today &&
          l.end_date >= today
      );

      setOnLeaveToday(onLeave);

      const pending = leaves.filter((l) => l.status_id === 2).length;
      setPendingLeaves(pending);

      setMessage("");
    } catch (err) {
      setMessage("Unable to load dashboard");
      console.error(err);
    }
  };

  /*  Same reusable card structure */
  const cards = [
    {
      title: "Attendance",
      desc: "View your attendance calendar",
      icon: <Calendar size={20} />,
      actions: [
        { to: "/attendance#calendar-only", label: "View", class: "btn-primary" }
      ]
    },
    {
      title: "Leave Requests",
      desc: "Apply or track leaves",
      icon: <FileText size={20} />,
      actions: [
        { to: "/leaves/new", label: "Request", class: "btn-success" }
      ]
    },
    {
      title: "Salary",
      desc: "View your salary",
      icon: <IndianRupee size={20} />,
      actions: [
        { to: "/salary", label: "View", class: "btn-outline-primary" }
      ]
    },
    {
      title: "Employees",
      desc: "View employee directory",
      icon: <Users size={20} />,
      actions: [
        { to: "/employees", label: "Employees", class: "btn-outline-dark" }
      ]
    }
  ];

  return (
    <div className="dashboard-container container py-4">

      {/* HEADER */}
      <div className="dashboard-header mb-4">
        <h3 className="fw-bold ">
          Welcome Back, <span className="text-gradient">{name}</span> 👋
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
          {message && <div className="alert alert-warning">{message}</div>}
          <div className="row g-4">
            {cards.map((card, index) => (
              <div className="col-md-6" key={index}>
                <div className="card dashboard-card h-100">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <div className="card-icon">{card.icon}</div>
                      <div className="card-title mt-3">{card.title}</div>
                      <div className="card-desc">{card.desc}</div>
                      {card.status && <div className="mt-2 text-muted small">{card.status}</div>}
                    </div>
                    <div className="d-flex flex-wrap gap-2 mt-3">
                      {card.actions.map((btn, i) => (
                        <Link key={i} to={btn.to} className={`btn btn-sm ${btn.class}`}>{btn.label}</Link>
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
                  { icon: <UserCheck size={14} className="text-success" />, label: "Working Hrs", value: workingHours, color: presentToday ? "text-success" : "text-muted" }
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

export default EmployeeDashboard;
