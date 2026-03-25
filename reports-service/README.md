# Reports Service

A Python FastAPI microservice for exporting EMS (Employee Management System) reports as CSV files. Connects directly to the same MySQL database as the main Node.js backend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI |
| ORM | SQLAlchemy |
| Database Driver | PyMySQL |
| Data Export | Pandas |
| Server | Uvicorn |

---

## Project Structure

```
reports-service/
├── app/
│   ├── model/
│   │   ├── employee.py         # Employee ORM model
│   │   ├── salary.py           # Salary ORM model
│   │   ├── attendance.py       # Attendance ORM model
│   │   ├── leave_request.py    # Leave Request ORM model
│   │   └── master_data.py      # Master Data ORM model
│   ├── routes/
│   │   └── reports.py          # All report endpoints
│   ├── services/
│   │   └── export_service.py   # CSV generation logic
│   ├── utils/
│   │   └── logger.py           # Logging setup
│   ├── database.py             # SQLAlchemy DB connection
│   └── main.py                 # FastAPI app entry point
├── .env                        # DB credentials (not committed)
├── requirements.txt            # Python dependencies
└── README.md
```

---

## Prerequisites

- Python 3.10+
- MySQL running with the `emp_data` database
- Main EMS backend running on `http://localhost:3000`

---

## Setup & Run

### 1. Clone and navigate
```bash
cd reports-service
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
Create a `.env` file in the root:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=emp_data
MAIN_API_URL=http://localhost:3000/api
```

### 4. Run the service
```bash
python -m uvicorn app.main:app --port 8000 --reload
```

Service runs at: `http://127.0.0.1:8000`

---

## API Endpoints

All endpoints return a downloadable **CSV file**.

### Employee Report
```
GET /reports/employees/export
```
Exports all employee data including name, email, phone, gender, DOB, hire date.

---

### Salary Report
```
GET /reports/salary/export
GET /reports/salary/export?month=2024-01
```
| Query Param | Type | Description |
|---|---|---|
| `month` | `YYYY-MM` | Optional — filter by month |

Exports employee code, name, basic salary, deductions, net salary, month.

---

### Attendance Report
```
GET /reports/attendance/export
GET /reports/attendance/export?from_date=2024-01-01&to_date=2024-01-31
```
| Query Param | Type | Description |
|---|---|---|
| `from_date` | `YYYY-MM-DD` | Optional — start date |
| `to_date` | `YYYY-MM-DD` | Optional — end date |

Exports check-in, check-out, work hours, and status (Present / Half Day / Absent) for all employees. Employees with no record on a date are listed as **Absent**.

---

### Leave Report
```
GET /reports/leave/export
GET /reports/leave/export?from_date=2024-01-01&to_date=2024-01-31&status_id=4
```
| Query Param | Type | Description |
|---|---|---|
| `from_date` | `YYYY-MM-DD` | Optional — start date |
| `to_date` | `YYYY-MM-DD` | Optional — end date |
| `status_id` | `int` | Optional — master_data_id for leave status |

Exports leave type, dates, total days, reason, and approval status.

---

## Attendance Status Logic

| Hours Worked | Status Stored |
|---|---|
| check_in only (no check_out) | Present |
| ≥ 8.5 hours | Present |
| 4 – 8.5 hours | Half Day |
| < 4 hours or no check_in | Absent |

---

## Master Data IDs Reference

| ID | Category | Value |
|---|---|---|
| 4 | attendance_status | Present |
| 5 | attendance_status | Absent |
| 6 | attendance_status | On Leave |
| 13 | attendance_status | Half Day |

---

## CORS

The service allows requests from `http://localhost:5174` (React frontend). To change this, update `allow_origins` in `app/main.py`.

---

## Interactive API Docs

FastAPI provides built-in Swagger UI:
```
http://127.0.0.1:8000/docs
```

---

## Dependencies

```
fastapi
uvicorn
sqlalchemy
pymysql
pandas
python-dotenv
```

Install all with:
```bash
pip install -r requirements.txt
```
