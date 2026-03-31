import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { Link } from "react-router-dom";
import { validateLocation } from "../../utils/validation";

function LocationManagement() {
  const emptyForm = {
    company_id: "",
    location_name: "",
    address: "",
    city: "",
    state: "",
    country: ""
  };

  const [locations, setLocations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchLocations();
    fetchCompanies();
  }, []);

  const fetchLocations = async () => {
    const res = await axiosClient.get("/locations");
    setLocations(res.data.data || res.data);
  };

  const fetchCompanies = async () => {
    const res = await axiosClient.get("/companies");
    setCompanies(res.data.data || res.data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLocation(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      ...formData,
      company_id: Number(formData.company_id) || null
    };

    try {
      if (editId) {
        await axiosClient.put(`/locations/${editId}`, payload);
        alert("Location Updated");
      } else {
        await axiosClient.post("/locations", payload);
        alert("Location Added");
      }
      setFormData(emptyForm);
      setEditId(null);
      fetchLocations();
    } catch (err) {
      console.log(err);
      alert("Error saving location");
    }
  };

  const editLocation = (loc) => {
    setFormData({
      company_id: loc.company_id,
      location_name: loc.location_name,
      address: loc.address,
      city: loc.city,
      state: loc.state,
      country: loc.country
    });
    setEditId(loc.location_id);
    setErrors({});
  };

  const deleteLocation = async (id) => {
    if (!window.confirm("Delete location?")) return;
    await axiosClient.delete(`/locations/${id}`);
    fetchLocations();
  };

  const getCompany = (id) => {
    const comp = companies.find((c) => c.company_id === id);
    return comp ? comp.company_name : id;
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-end mb-3">
        <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">
          Back to Dashboard
        </Link>
      </div>
      <div className="card mb-4">
        <div className="card-header bg-primary text-white text-center">
          {editId ? "Update Location" : "Add Location"}
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <select
                  className={`form-select ${errors.company_id ? "is-invalid" : ""}`}
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleChange}
                >
                  <option value="">Select Company</option>
                  {companies.map((c) => (
                    <option key={c.company_id} value={c.company_id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
                {errors.company_id && <div className="invalid-feedback">{errors.company_id}</div>}
              </div>

              <div className="col-md-6">
                <input
                  type="text"
                  className={`form-control ${errors.location_name ? "is-invalid" : ""}`}
                  placeholder="Location Name"
                  name="location_name"
                  value={formData.location_name}
                  onChange={handleChange}
                />
                {errors.location_name && <div className="invalid-feedback">{errors.location_name}</div>}
              </div>

              <div className="col-md-12">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <input
                  type="text"
                  className={`form-control ${errors.city ? "is-invalid" : ""}`}
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                />
                {errors.city && <div className="invalid-feedback">{errors.city}</div>}
              </div>

              <div className="col-md-4">
                <input
                  type="text"
                  className={`form-control ${errors.state ? "is-invalid" : ""}`}
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                />
                {errors.state && <div className="invalid-feedback">{errors.state}</div>}
              </div>

              <div className="col-md-4">
                <input
                  type="text"
                  className={`form-control ${errors.country ? "is-invalid" : ""}`}
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleChange}
                />
                {errors.country && <div className="invalid-feedback">{errors.country}</div>}
              </div>

              <div className="col-12 text-end">
                <button className="btn btn-success me-2">{editId ? "Update" : "Add"}</button>
                {editId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => { setFormData(emptyForm); setEditId(null); setErrors({}); }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Company</th>
            <th>Location</th>
            <th>Address</th>
            <th>City</th>
            <th>State</th>
            <th>Country</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((l) => (
            <tr key={l.location_id}>
              <td>{l.location_id}</td>
              <td>{getCompany(l.company_id)}</td>
              <td>{l.location_name}</td>
              <td>{l.address}</td>
              <td>{l.city}</td>
              <td>{l.state}</td>
              <td>{l.country}</td>
              <td>
                <button className="btn btn-primary btn-sm me-2" onClick={() => editLocation(l)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteLocation(l.location_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LocationManagement;
