import { useEffect, useState } from "react";
import axios from "axios";
import "./profile.css"

function Avatar({ name }) {
  const initials = (name || "").split(" ").map(n => n[0] || "").join("").slice(0,2).toUpperCase();
  return (
    <div style={{
      width:80, height:80, borderRadius:40, backgroundColor:'#0d6efd', color:'#fff',
      display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:700
    }}>{initials}</div>
  );
}

function ProfileCard() {
  const empIdRaw = localStorage.getItem("employee_id");
  const empId = empIdRaw && empIdRaw !== "undefined" ? Number(empIdRaw) : null;

  const [employee, setEmployee] = useState(null);
  const [company, setCompany] = useState(null);
  const [location, setLocation] = useState(null);
  const [role, setRole] = useState(null);
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empId) { setLoading(false); return; }

    const fetchAll = async () => {
      try {
        const empRes = await axios.get(`http://localhost:3000/api/employees/${empId}`);
        const emp = empRes.data.data || empRes.data || empRes.data?.employee || null;
        setEmployee(emp);

        if (emp?.company_id) {
          try {
            const c = await axios.get(`http://localhost:3000/api/companies/${emp.company_id}`);
            setCompany(c.data.data || c.data || null);
          } catch (_) { setCompany(null); }
        }

        if (emp?.location_id) {
          try {
            const l = await axios.get(`http://localhost:3000/api/locations/${emp.location_id}`);
            setLocation(l.data.data || l.data || null);
          } catch (_) { setLocation(null); }
        }

        if (emp?.role_id) {
          try {
            const r = await axios.get(`http://localhost:3000/api/roles/${emp.role_id}`);
            const rr = r.data.data || r.data || null;
            setRole(Array.isArray(rr) ? rr[0] : rr);
          } catch (_) { setRole(null); }
        }

        if (emp?.reporting_manager_id) {
          try {
            const m = await axios.get(`http://localhost:3000/api/employees/${emp.reporting_manager_id}`);
            const mm = m.data.data || m.data || null;
            setManager(mm);
          } catch (_) { setManager(null); }
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [empId]);

  function formatDate(val) {
    if (!val) return '-';
    // accept YYYY-MM-DD or ISO
    const d = new Date(val);
    if (isNaN(d)) return val;
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  if (loading) return <div className="card p-3">Loading profile...</div>;
  if (!employee) return <div className="card p-3">No profile available</div>;

  return (
    <div className="card p-3" style={{ fontSize: '1rem', border: '1px solid #dee2e6' }}>
      <div className="d-flex align-items-center gap-3">
        <Avatar name={`${employee.first_name || ''} ${employee.last_name || ''}`} />
        <div>
          <div className="fw-bold">{employee.first_name} {employee.last_name}</div>
          <div className="text-muted">
            {role?.role_name ? (
              <>
                <span className="badge bg-info text-dark me-2" style={{ fontSize: '0.85rem', padding: '0.35rem 0.6rem' }}>{role.role_name}</span>
                <span>{employee.employee_code}</span>
              </>
            ) : (
              <span>{employee.employee_code}</span>
            )}
          </div>
        </div>
      </div>

      <hr />

      <div className="small">
        <div><strong>Phone:</strong> {employee.phone || '-'}</div>
        <div><strong>DOB:</strong> {formatDate(employee.dob)}</div>
        <div><strong>Position:</strong> {employee.position_title || '-'}</div>
        <div><strong>Department:</strong> {employee.department_name || '-'}</div>
        <div><strong>Employment Type:</strong> {employee.employment_type || ({1: 'Full-Time', 2: 'Part-Time', 3: 'Contractor'}[employee.employment_type_id]) || '-'}</div>
        <div><strong>Manager:</strong> {manager ? `${manager.first_name} ${manager.last_name}` : (employee.reporting_manager_id ? employee.reporting_manager_id : '-')}</div>
        <div><strong>Hire Date:</strong> {formatDate(employee.hire_date)}</div>
        <div><strong>Gender:</strong> {employee.gender || '-'}</div>
      </div>

      <hr />

      <div>
        <div className="fw-bold">Company</div>
        {company ? (
          <div className="small">
            <div><strong>Name:</strong> {company.company_name || '-'}</div>
            <div><strong>Registration:</strong> {company.registration_number || '-'}</div>
            <div><strong>Email:</strong> {company.email || '-'}</div>
            <div><strong>Phone:</strong> {company.phone || '-'}</div>
          </div>
        ) : (
          <div className="small text-muted">No company details</div>
        )}
      </div>

      <hr />

      <div>
        <div className="fw-bold">Location</div>
        {location ? (
          <div className="small">
            <div><strong>Name:</strong> {location.location_name || '-'}</div>
            <div><strong>Address:</strong> {location.address || '-'}</div>
            <div><strong>City:</strong> {location.city || '-'}</div>
            <div><strong>State:</strong> {location.state || '-'}</div>
            <div><strong>Country:</strong> {location.country || '-'}</div>
          </div>
        ) : (
          <div className="small text-muted">No location details</div>
        )}
      </div>

    </div>
  );
}

export default ProfileCard;
