import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileDown, Users, IndianRupee, Calendar, ClipboardList, ArrowLeft } from "lucide-react";
import axiosClient from "../../api/axiosClient";

const REPORTS_BASE = `${import.meta.env.VITE_REPORTS_URL}/reports`;

async function downloadUrl(url) {
  const token = localStorage.getItem("token");
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) { alert("Export failed: " + res.status); return; }
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = url.split("/").pop().split("?")[0] + ".csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

function Reports() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const dashboardPath = role === "Admin" ? "/admin" : "/dashboard";
  const [salaryMonth,   setSalaryMonth]   = useState("");
  const [attFrom,       setAttFrom]       = useState("");
  const [attTo,         setAttTo]         = useState("");
  const [leaveFrom,     setLeaveFrom]     = useState("");
  const [leaveTo,       setLeaveTo]       = useState("");
  const [leaveStatus,   setLeaveStatus]   = useState("");
  const [leaveStatuses, setLeaveStatuses] = useState([]);

  useEffect(() => {
    axiosClient.get("/master-data/category/leave_status")
      .then(res => setLeaveStatuses(res.data.data || res.data))
      .catch(console.error);
  }, []);

  const buildUrl = (path, params) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) q.append(k, v); });
    const qs = q.toString();
    return `${REPORTS_BASE}${path}${qs ? "?" + qs : ""}`;
  };

  const reports = [
    {
      title: "Employee Report",
      desc:  "Export all employee records",
      icon:  <Users size={22} className="text-primary" />,
      filters: null,
      onExport: () => downloadUrl(buildUrl("/employees/export", {})),
    },
    {
      title: "Salary Report",
      desc:  "Filter by month",
      icon:  <IndianRupee size={22} className="text-success" />,
      filters: (
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <label className="form-label mb-0 text-muted small">Month</label>
          <input
            type="month"
            className="form-control form-control-sm"
            style={{ width: "160px" }}
            value={salaryMonth}
            onChange={e => setSalaryMonth(e.target.value)}
          />
        </div>
      ),
      onExport: () => downloadUrl(buildUrl("/salary/export", { month: salaryMonth })),
    },
    {
      title: "Attendance Report",
      desc:  "Filter by date range",
      icon:  <Calendar size={22} className="text-warning" />,
      filters: (
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <label className="form-label mb-0 text-muted small">From</label>
          <input type="date" className="form-control form-control-sm" style={{ width: "150px" }} value={attFrom} onChange={e => setAttFrom(e.target.value)} />
          <label className="form-label mb-0 text-muted small">To</label>
          <input type="date" className="form-control form-control-sm" style={{ width: "150px" }} value={attTo}   onChange={e => setAttTo(e.target.value)} />
        </div>
      ),
      onExport: () => downloadUrl(buildUrl("/attendance/export", { from_date: attFrom, to_date: attTo })),
    },
    {
      title: "Leave Report",
      desc:  "Filter by date range & status",
      icon:  <ClipboardList size={22} className="text-danger" />,
      filters: (
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <label className="form-label mb-0 text-muted small">From</label>
          <input type="date" className="form-control form-control-sm" style={{ width: "150px" }} value={leaveFrom} onChange={e => setLeaveFrom(e.target.value)} />
          <label className="form-label mb-0 text-muted small">To</label>
          <input type="date" className="form-control form-control-sm" style={{ width: "150px" }} value={leaveTo}   onChange={e => setLeaveTo(e.target.value)} />
          <label className="form-label mb-0 text-muted small">Status</label>
          <select
            className="form-select form-select-sm"
            style={{ width: "130px" }}
            value={leaveStatus}
            onChange={e => setLeaveStatus(e.target.value)}
          >
            <option value="">All</option>
            {leaveStatuses.map(s => (
              <option key={s.master_data_id} value={s.master_data_id}>
                {s.value}
              </option>
            ))}
          </select>
        </div>
      ),
      onExport: () => downloadUrl(buildUrl("/leave/export", { from_date: leaveFrom, to_date: leaveTo, status_id: leaveStatus })),
    },
  ];

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center gap-2 mb-4">
        <button
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
          onClick={() => navigate(dashboardPath)}
        >
          <ArrowLeft size={15} /> Back to Dashboard
        </button>
        <h4 className="fw-bold mb-0">📊 Reports</h4>
      </div>
      <div className="row g-4">
        {reports.map((r, i) => (
          <div className="col-md-6" key={i}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-2">
                  {r.icon}
                  <div>
                    <div className="fw-semibold">{r.title}</div>
                    <div className="text-muted small">{r.desc}</div>
                  </div>
                </div>
                {r.filters && <div>{r.filters}</div>}
                <div className="mt-auto">
                  <button
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                    onClick={r.onExport}
                  >
                    <FileDown size={15} /> Export CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reports;
