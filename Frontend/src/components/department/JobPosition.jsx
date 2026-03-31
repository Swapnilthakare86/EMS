import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { Link } from "react-router-dom";

function JobPosition() {
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [positionTitle, setPositionTitle] = useState("");
  const [search, setSearch] = useState("");

  const [editId, setEditId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    fetchDepartments();
    fetchPositions();
  }, []);

  const fetchDepartments = async () => {
    const res = await axiosClient.get("/departments");
    setDepartments(res.data.data || res.data);
  };

  const fetchPositions = async () => {
    const res = await axiosClient.get("/job-positions");
    const all = res.data.data || res.data;
    setPositions(all);
    setFilteredPositions(all);
  };

  //  Filter (Search + Department)
  useEffect(() => {
    let data = [...positions];

    if (selectedDepartment) {
      data = data.filter((p) => p.department_id == selectedDepartment);
    }

    if (search) {
      data = data.filter((p) =>
        p.position_title.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredPositions(data);
    setCurrentPage(1);
  }, [search, selectedDepartment, positions]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDepartment) {
      alert("Please select department");
      return;
    }

    const data = {
      department_id: selectedDepartment,
      position_title: positionTitle
    };

    try {
      if (editId) {
        await axiosClient.put(
          `/job-positions/${editId}`,
          data
        );
        alert("Updated");
      } else {
        await axiosClient.post("/job-positions", data);
        alert("Added");
      }

      setPositionTitle("");
      setEditId(null);
      fetchPositions();

    } catch (err) {
      alert("Error");
    }
  };

  const editPosition = (pos) => {
    setPositionTitle(pos.position_title);
    setSelectedDepartment(pos.department_id);
    setEditId(pos.job_position_id);
  };

  const deletePosition = async (id) => {
    if (!window.confirm("Delete?")) return;

    await axiosClient.delete(`/job-positions/${id}`);;
    fetchPositions();
  };

  //  Pagination Logic
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = filteredPositions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPositions.length / rowsPerPage);

  return (
    <div className="container">

      <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">
        Back to Dashboard
      </Link>

      {/* Summary Cards */}
      <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">

        <div className="card text-center shadow-sm" style={{ width: "130px" }}>
          <div className="card-body p-2">
            <div className="text-muted">Departments</div>
            <div className="fw-bold">{departments.length}</div>
          </div>
        </div>

        <div className="card text-center shadow-sm" style={{ width: "130px" }}>
          <div className="card-body p-2">
            <div className="text-muted">Positions</div>
            <div className="fw-bold">
              {positions.length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter + Form (Same Card FIXED UI) */}
      <div className="card shadow-sm rounded-4 mb-4 col-md-8 mx-auto">

        {/* Header */}
        <div className="card-header text-center">
          {editId ? "Update Position" : "Add Position"}
        </div>

        <div className="card-body">

          {/* Filter Row */}
          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <select
                className="form-select"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.department_id} value={d.department_id}>
                    {d.department_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <input
              className="form-control col-md-3"
              placeholder="Position Title"
              value={positionTitle}
              onChange={(e) => setPositionTitle(e.target.value)}
              required
            />

            <div className="text-center mt-2">
              <button className="btn btn-success me-2">
                {editId ? "Update" : "Add"}
              </button>

              {editId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditId(null);
                    setPositionTitle("");
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

        </div>
      </div>
      <div className="card-header text-center">
        Job Positions List
      </div>
      <div className="col-md-3 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search position..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {/* Table */}
      <div className="card shadow-sm rounded-4">

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>Position</th>
                <th>Department</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">No data</td>
                </tr>
              ) : (
                currentRows.map((p) => {
                  const dept = departments.find(
                    (d) => d.department_id == p.department_id
                  );

                  return (
                    <tr key={p.job_position_id}>
                      <td>{p.position_title}</td>
                      <td>{dept ? dept.department_name : "-"}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm me-2"
                          onClick={() => editPosition(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deletePosition(p.job_position_id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-center p-3">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`btn btn-sm mx-1 ${currentPage === i + 1 ? "btn-dark" : "btn-outline-dark"
                }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>

      </div>

    </div>
  );
}
export default JobPosition;