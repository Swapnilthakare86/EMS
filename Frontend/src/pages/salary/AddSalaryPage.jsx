
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import AddSalary from "../../components/salary/AddSalary";

function AddSalaryPage() {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axiosClient.get("/employees");
        setEmployees(res.data.data || res.data || []);
      } catch (err) {
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <div className="container mt-4">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      <AddSalary employees={employees} />
    </div>
  );
}

export default AddSalaryPage;
