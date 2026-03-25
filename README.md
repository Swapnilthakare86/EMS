# Employee Management System (EMS)

A full-stack web application for managing employees, attendance, leaves, salary, and departments — with role-based access for Admin, HR, Manager, and Employee.

---

## Tech Stack

**Frontend**
- React 19 + Vite
- React Router DOM v7
- Bootstrap 5 + React Bootstrap
- Axios
- React Calendar
- Lucide React

**Backend**
- Node.js + Express 5
- MySQL2
- JWT Authentication
- Bcryptjs
- Nodemailer
- Express Validator

---

## Project Structure

```
EMS/
├── Backend/
│   ├── config/          # DB connection, mailer
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # MySQL query functions
│   ├── routes/          # API route definitions
│   ├── utils/           # Auth helpers
│   └── app.js           # Express entry point
│
└── Frontend/
    └── src/
        ├── components/  # Attendance, Leave, Employee, Salary, Dashboard, etc.
        ├── pages/       # Auth pages, Dashboard pages
        ├── routes/      # ProtectedRoute, PublicRoute
        ├── utils/       # Validation helpers
        └── App.jsx      # Route definitions
```

---

## Features

### Authentication
- Login / Register / Forgot Password / Reset Password
- JWT-based auth with role stored in localStorage
- Protected routes by role

### Roles
| Role | Access |
|------|--------|
| Admin | Full access to all modules |
| HR | Employees, Leaves, Salary, Attendance |
| Manager | Reporting employees, Leave approvals, Attendance |
| Employee | Own attendance, own leaves, own salary |

### Employee Management
- Create, update, delete employees
- Auto-generated employee codes (EMP001, EMP002, ...)
- Assign reporting manager, department, job position, location

### Attendance
- Check-in / Check-out tracking
- Auto attendance status: Present (≥ 8.5 hrs) / Absent
- UI badges: Late (check-in after 10:00 AM), Half Day (4–8.5 hrs)
- Personal attendance calendar with P / A / L / WO tiles
- Monthly summary: Working Days, Present, Absent

### Leave Management
- Apply, update, cancel leave requests
- Manager Leave Approval — approve / reject with status dropdown
- Leave List with filters: Employee, Date, Status
- Role-scoped views:
  - Employee/HR: own leaves with Update/Cancel on Pending
  - Manager: leaves assigned via `approved_by` or from reporting employees
  - Admin/HR: all employees' leaves

### Salary
- View and manage salary records
- Add salary entries

### Departments & Job Positions
- Create and manage departments
- Create and manage job positions

### Locations & Companies
- Manage office locations
- Manage company details

### Dashboards
- **Admin**: Today's Total / Present / Absent / On Leave summary
- **HR**: Org-wide attendance summary
- **Manager**: Reporting employees summary + Pending leave count
- **Employee**: Total employees + own working hours today

---

## Getting Started

### Prerequisites
- Node.js >= 18
- MySQL >= 8
- npm

---

### 1. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE emp_data;
```

Import your schema and seed data into `emp_data`.

---

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/`:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=<your_db_password>
DB_NAME=emp_data

JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES=1d
RESET_TOKEN_EXPIRES=5m

FRONTEND_URL=http://localhost:5174

EMAIL_USER=<your_email>
EMAIL_PASS=<your_email_password>
```

Start the backend:

```bash
# Development
npm run dev

# Production
npm start
```

Backend runs on: `http://localhost:3000`

---

### 3. Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5174`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password/:token` | Reset password |
| GET | `/api/employees` | Get all employees |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |
| GET | `/api/employees/managers` | Get managers list |
| PATCH | `/api/employees/:id/manager` | Update reporting manager |
| GET | `/api/attendance` | Get all attendance |
| POST | `/api/attendance` | Create attendance |
| PUT | `/api/attendance/:id` | Update attendance |
| GET | `/api/leave` | Get all leave requests |
| POST | `/api/leave` | Apply leave |
| PUT | `/api/leave/:id` | Update leave |
| PUT | `/api/leave/status/:id` | Approve/Reject leave |
| DELETE | `/api/leave/:id` | Cancel leave |
| GET | `/api/salary` | Get all salary records |
| GET | `/api/departments` | Get departments |
| GET | `/api/job-positions` | Get job positions |
| GET | `/api/locations` | Get locations |
| GET | `/api/companies` | Get companies |
| GET | `/api/master-data/category/:category` | Get master data by category |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: 3000) |
| `DB_HOST` | MySQL host |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | MySQL database name |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES` | JWT expiry duration |
| `RESET_TOKEN_EXPIRES` | Password reset token expiry |
| `FRONTEND_URL` | Frontend URL for CORS and email links |
| `EMAIL_USER` | SMTP email address |
| `EMAIL_PASS` | SMTP email password |

---

## Key Business Rules

- Attendance status stored as `1` (Present) or `2` (Absent) in DB
- Present = check-in exists + total hours ≥ 8.5
- Half Day = 4–8.5 hours (UI badge only, not stored)
- Late = check-in after 10:00 AM (UI badge only)
- Leave status IDs are dynamic — fetched from `master_data` table
- `approved_by` on leave request = the manager who will approve it
- Changing manager in leave form also updates employee's `reporting_manager_id`
- Calendar tiles show from `hire_date` to today only
- Weekends show as WO (Weekend Off)
---

## Scripts

**Backend**
```bash
npm run dev    # Start with nodemon (auto-reload)
npm start      # Start with node
```

**Frontend**
```bash
npm run dev      # Start Vite dev server
```
