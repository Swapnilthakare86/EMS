from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Attendance(Base):
    __tablename__ = "attendance"

    attendance_id        = Column(Integer, primary_key=True, index=True)
    employee_id          = Column(Integer, ForeignKey("employee.employee_id"))
    attendance_date      = Column(Date)
    check_in             = Column(Time)
    check_out            = Column(Time)
    attendance_status_id = Column(Integer)
    remarks              = Column(String(255))
