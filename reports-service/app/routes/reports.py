from fastapi import APIRouter, Depends, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from typing import Optional

from app.database import get_db
from app.model.employee import Employee
from app.model.salary import Salary
from app.model.attendance import Attendance
from app.model.leave_request import LeaveRequest
from app.model.master_data import MasterData
from app.services.export_service import create_csv
from app.utils.logger import logger

router = APIRouter()


# ── 1. Employee Report (all employees) ──────────────────────────────────────
@router.get("/employees/export")
def export_employees(db: Session = Depends(get_db)):
    rows = (
        db.query(Employee)
        .order_by(Employee.employee_code)
        .all()
    )
    data = [
        {
            "Employee Code": e.employee_code,
            "First Name":    e.first_name,
            "Last Name":     e.last_name,
            "Email":         e.email,
            "Phone":         e.phone,
            "Gender":        e.gender,
            "DOB":           str(e.dob) if e.dob else "",
            "Hire Date":     str(e.hire_date) if e.hire_date else "",
        }
        for e in rows
    ]
    file = create_csv(data, "employees")
    logger.info("Employee report exported")
    return FileResponse(file, filename="employees.csv", media_type="text/csv")


# ── 2. Salary Report (filter by month YYYY-MM) ──────────────────────────────
@router.get("/salary/export")
def export_salary(
    month: Optional[str] = Query(None, description="Filter month YYYY-MM"),
    db: Session = Depends(get_db),
):
    q = db.query(Salary, Employee).join(Employee, Salary.employee_id == Employee.employee_id)

    if month:
        try:
            year, mon = map(int, month.split("-"))
            q = q.filter(
                extract("year",  Salary.start_date) == year,
                extract("month", Salary.start_date) == mon,
            )
        except ValueError:
            pass

    rows = q.order_by(Salary.start_date.desc()).all()
    data = [
        {
            "Employee Code": e.employee_code,
            "Name":          f"{e.first_name} {e.last_name}",
            "Email":         e.email,
            "Basic Salary":  float(s.basic_salary or 0),
            "Deductions":    float(s.deductions or 0),
            "Net Salary":    float((s.basic_salary or 0) - (s.deductions or 0)),
            "Month":         str(s.start_date) if s.start_date else "",
        }
        for s, e in rows
    ]
    file = create_csv(data, "salary")
    logger.info(f"Salary report exported month={month}")
    return FileResponse(file, filename="salary_report.csv", media_type="text/csv")


# ── 3. Attendance Report (filter by date range, includes absent employees) ───
@router.get("/attendance/export")
def export_attendance(
    from_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    to_date:   Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    db: Session = Depends(get_db),
):
    from datetime import date, timedelta, datetime

    def calc_status(check_in, check_out):
        if not check_in:
            return "Absent"
        if not check_out:
            return "Present"
        # convert time to datetime for subtraction
        base = date(1970, 1, 1)
        dt_in  = datetime.combine(base, check_in)
        dt_out = datetime.combine(base, check_out)
        if dt_out <= dt_in:
            return "Absent"
        hours = (dt_out - dt_in).seconds / 3600
        if hours >= 8.5:
            return "Present"
        if hours >= 4:
            return "Half Day"
        return "Present"

    def calc_work_hours(check_in, check_out):
        if not check_in or not check_out:
            return ""
        base = date(1970, 1, 1)
        dt_in  = datetime.combine(base, check_in)
        dt_out = datetime.combine(base, check_out)
        if dt_out <= dt_in:
            return ""
        total = (dt_out - dt_in).seconds
        h, rem = divmod(total, 3600)
        m, s   = divmod(rem, 60)
        return f"{h}h {m}m"

    # All employees
    all_employees = db.query(Employee).order_by(Employee.employee_code).all()

    # Attendance records in range
    q = db.query(Attendance, Employee).join(Employee, Attendance.employee_id == Employee.employee_id)
    if from_date:
        q = q.filter(Attendance.attendance_date >= from_date)
    if to_date:
        q = q.filter(Attendance.attendance_date <= to_date)
    att_rows = q.order_by(Attendance.attendance_date.asc()).all()

    # Build set of (employee_id, date) that already have a record
    recorded = {(a.employee_id, str(a.attendance_date)) for a, _ in att_rows}

    # Build date range list
    dates = []
    if from_date and to_date:
        cur = date.fromisoformat(from_date)
        end = date.fromisoformat(to_date)
        while cur <= end:
            dates.append(str(cur))
            cur += timedelta(days=1)

    # Rows with actual attendance records
    data = [
        {
            "Employee Code": e.employee_code,
            "Name":          f"{e.first_name} {e.last_name}",
            "Date":          str(a.attendance_date),
            "Check In":      str(a.check_in)  if a.check_in  else "",
            "Check Out":     str(a.check_out) if a.check_out else "",
            "Work Hours":    calc_work_hours(a.check_in, a.check_out),
            "Status":        calc_status(a.check_in, a.check_out),
            "Remarks":       a.remarks or "",
        }
        for a, e in att_rows
    ]

    # Add Absent rows for employees with no record on each date
    for d in dates:
        for e in all_employees:
            if (e.employee_id, d) not in recorded:
                data.append({
                    "Employee Code": e.employee_code,
                    "Name":          f"{e.first_name} {e.last_name}",
                    "Date":          d,
                    "Check In":      "",
                    "Check Out":     "",
                    "Work Hours":    "",
                    "Status":        "Absent",
                    "Remarks":       "",
                })

    data.sort(key=lambda x: (x["Date"], x["Employee Code"]))

    file = create_csv(data, "attendance")
    logger.info(f"Attendance report exported from={from_date} to={to_date}")
    return FileResponse(file, filename="attendance_report.csv", media_type="text/csv")


# ── 4. Leave Report (filter by date range + status) ──────────────────────────
@router.get("/leave/export")
def export_leave(
    from_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    to_date:   Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    status_id: Optional[int] = Query(None, description="Status master_data_id"),
    db: Session = Depends(get_db),
):
    # Load leave_type and leave_status labels from master_data
    master_rows = db.query(MasterData).filter(
        MasterData.category.in_(["leave_type", "leave_status"])
    ).all()
    leave_type_map   = {r.master_data_id: r.value for r in master_rows if r.category == "leave_type"}
    leave_status_map = {r.master_data_id: r.value for r in master_rows if r.category == "leave_status"}

    q = db.query(LeaveRequest, Employee).join(Employee, LeaveRequest.employee_id == Employee.employee_id)

    if from_date:
        q = q.filter(LeaveRequest.start_date >= from_date)
    if to_date:
        q = q.filter(LeaveRequest.end_date <= to_date)
    if status_id is not None:
        q = q.filter(LeaveRequest.status_id == status_id)

    rows = q.order_by(LeaveRequest.start_date.desc()).all()
    data = [
        {
            "Employee Code": e.employee_code,
            "Name":          f"{e.first_name} {e.last_name}",
            "Leave Type":    leave_type_map.get(l.leave_type_id, str(l.leave_type_id)),
            "Start Date":    str(l.start_date),
            "End Date":      str(l.end_date),
            "Total Days":    l.total_days,
            "Reason":        l.reason or "",
            "Status":        leave_status_map.get(l.status_id, str(l.status_id)),
            "Applied On":    str(l.applied_on) if l.applied_on else "",
        }
        for l, e in rows
    ]
    file = create_csv(data, "leave")
    logger.info(f"Leave report exported from={from_date} to={to_date} status={status_id}")
    return FileResponse(file, filename="leave_report.csv", media_type="text/csv")
