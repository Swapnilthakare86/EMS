import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { validateCompany } from "../../utils/validation";

function CompanyManagement() {

const emptyForm = {
	company_name: "",
	registration_number: "",
	email: "",
	phone: "",
	created_at: ""
};

const [companies, setCompanies] = useState([]);
const [formData, setFormData] = useState(emptyForm);
const [editId, setEditId] = useState(null);
const [errors, setErrors] = useState({});


// ================= FETCH COMPANIES =================

useEffect(() => {
	fetchCompanies();
}, []);

const fetchCompanies = async () => {
	try {
		const res = await axios.get("http://localhost:3000/api/companies");
		setCompanies(res.data.data || res.data);
	} catch (err) {
		console.log(err);
	}
};


// ================= HANDLE INPUT =================

const handleChange = (e) => {

	setFormData({
		...formData,
		[e.target.name]: e.target.value
	});

	setErrors({
		...errors,
		[e.target.name]: ""
	});

};


// ================= ADD / UPDATE =================

const handleSubmit = async (e) => {
	e.preventDefault();

	const validationErrors = validateCompany(formData);

	if (Object.keys(validationErrors).length > 0) {
		setErrors(validationErrors);
		return;
	}

	setErrors({});

	try {

		if (editId) {

			await axios.put(
				`http://localhost:3000/api/companies/${editId}`,
				formData
			);

			alert("Company Updated");

		} else {

			await axios.post(
				"http://localhost:3000/api/companies",
				formData
			);

			alert("Company Added");
		}

		setFormData(emptyForm);
		setEditId(null);
		fetchCompanies();

	} catch (err) {
		console.log(err);
		alert("Error saving company");
	}

};


// ================= EDIT =================

const editCompany = (company) => {

	setFormData({
		company_name: company.company_name,
		registration_number: company.registration_number,
		email: company.email,
		phone: company.phone,
		created_at: company.created_at?.split("T")[0]
	});

	setEditId(company.company_id);
};


// ================= DELETE =================

const deleteCompany = async (id) => {

	if (!window.confirm("Delete this company?")) return;

	try {

		await axios.delete(
			`http://localhost:3000/api/companies/${id}`
		);

		alert("Company Deleted");

		fetchCompanies();

	} catch (err) {
		console.log(err);
		alert("Error deleting company");
	}

};


// ================= UI =================

return (

<div className="container mt-4">

<div className="d-flex justify-content-end mb-3">
  <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">
    Back to Dashboard
  </Link>
</div>

{/* ================= COMPANY FORM ================= */}

<div className="card shadow mb-4">

<div className="card-header bg-primary text-white text-center fw-bold">
{editId ? "Update Company" : "Add Company"}
</div>

<div className="card-body">

<form onSubmit={handleSubmit}>

<div className="row g-3">

{/* Company Name */}

<div className="col-md-6">

<label className="form-label fw-semibold">
Company Name
</label>

<input
type="text"
className="form-control"
name="company_name"
value={formData.company_name}
onChange={handleChange}
/>

{errors.company_name && (
<small className="text-danger">{errors.company_name}</small>
)}

</div>


{/* Registration Number */}

<div className="col-md-6">

<label className="form-label fw-semibold">
Registration Number
</label>

<input
type="text"
className="form-control"
name="registration_number"
value={formData.registration_number}
onChange={handleChange}
/>

{errors.registration_number && (
<small className="text-danger">{errors.registration_number}</small>
)}

</div>


{/* Email */}

<div className="col-md-6">

<label className="form-label fw-semibold">
Email
</label>

<input
type="email"
className="form-control"
name="email"
value={formData.email}
onChange={handleChange}
/>

{errors.email && (
<small className="text-danger">{errors.email}</small>
)}

</div>


{/* Phone */}

<div className="col-md-6">

<label className="form-label fw-semibold">
Phone
</label>

<input
type="text"
className="form-control"
name="phone"
value={formData.phone}
onChange={handleChange}
/>

{errors.phone && (
<small className="text-danger">{errors.phone}</small>
)}

</div>


{/* Created Date */}

<div className="col-md-6">

<label className="form-label fw-semibold">
Created Date
</label>

<input
type="date"
className="form-control"
name="created_at"
value={formData.created_at}
onChange={handleChange}
/>

{errors.created_at && (
<small className="text-danger">{errors.created_at}</small>
)}

</div>


{/* Buttons */}

<div className="col-12 text-end mt-3">

<button className="btn btn-success me-2 px-4">
{editId ? "Update Company" : "Add Company"}
</button>

{editId && (

<button
type="button"
className="btn btn-secondary"
onClick={() => {
setFormData(emptyForm);
setEditId(null);
setErrors({});
}}
>
Cancel
</button>

)}

</div>

</div>

</form>

</div>

</div>


{/* COMPANY LIST */}

<div className="card shadow">

<div className="card-header bg-dark text-white fw-bold">
Company List
</div>

<div className="card-body">

<table className="table table-bordered table-hover">

<thead className="table-dark">

<tr>
<th>ID</th>
<th>Company Name</th>
<th>Registration</th>
<th>Email</th>
<th>Phone</th>
<th>Created</th>
<th width="150">Action</th>
</tr>

</thead>

<tbody>

{companies.length === 0 ? (

<tr>
<td colSpan="7" className="text-center">
No companies found
</td>
</tr>

) : (

companies.map((c) => (

<tr key={c.company_id}>

<td>{c.company_id}</td>
<td>{c.company_name}</td>
<td>{c.registration_number}</td>
<td>{c.email}</td>
<td>{c.phone}</td>
<td>{c.created_at}</td>

<td>

<button
className="btn btn-primary btn-sm me-2"
onClick={() => editCompany(c)}
>
Edit
</button>

<button
className="btn btn-danger btn-sm"
onClick={() => deleteCompany(c.company_id)}
>
Delete
</button>

</td>

</tr>

))

)}

</tbody>

</table>

</div>

</div>

</div>

);

}

export default CompanyManagement; 

