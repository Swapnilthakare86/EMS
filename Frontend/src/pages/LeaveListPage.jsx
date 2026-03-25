import { Link } from "react-router-dom";
import LeaveList from "../components/leave/LeaveList";

function LeaveListPage() {
  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Leave List</h4>
        <Link to="/admin" className="btn btn-outline-secondary btn-sm">
          Back to Dashboard
        </Link>
      </div>
      <LeaveList />
    </div>
  );
}

export default LeaveListPage;
