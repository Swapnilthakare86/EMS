from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class LeaveRequest(Base):
    __tablename__ = "leave_request"

    leave_request_id = Column(Integer, primary_key=True, index=True)
    employee_id      = Column(Integer, ForeignKey("employee.employee_id"))
    leave_type_id    = Column(Integer)
    start_date       = Column(Date)
    end_date         = Column(Date)
    total_days       = Column(Integer)
    reason           = Column(String(500))
    status_id        = Column(Integer)
    applied_on       = Column(Date)
    approved_by      = Column(Integer)
