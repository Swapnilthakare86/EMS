import { Link } from "react-router-dom";

function Sidebar() {

  const role = localStorage.getItem("role");

  return (

<div className="bg-light p-3" style={{width:"220px",minHeight:"100vh"}}>

<h5>Menu</h5>

{role==="Admin" &&(
<>
<Link to="/employees">Employees</Link><br/>
<Link to="/companies">Companies</Link><br/>
<Link to="/departments">Departments</Link><br/>
<Link to="/locations">Locations</Link>
</>
)}

{role==="HR" &&(
<>
<Link to="/employees">Employees</Link><br/>
<Link to="/salary">Salary</Link>
</>
)}

{role==="Manager" &&(
<>
<Link to="/manager-approval">Leave Approval</Link><br/>
<Link to="/salary">Salary</Link>
</>
)}

{role==="Employee" &&(
<>
<Link to="/attendance">Attendance</Link><br/>
<Link to="/leave-add">Leave Request</Link><br/>
<Link to="/salary">Salary</Link>
</>
)}

</div>

  );
}

export default Sidebar;
