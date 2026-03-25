from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Employee(Base):
    __tablename__ = "employee"

    employee_id    = Column(Integer, primary_key=True, index=True)
    employee_code  = Column(String(20))
    first_name     = Column(String(100))
    last_name      = Column(String(100))
    email          = Column(String(150), unique=True, index=True)
    phone          = Column(String(20))
    gender         = Column(String(10))
    dob            = Column(Date)
    hire_date      = Column(Date)
    department_id  = Column(Integer)
    job_position_id= Column(Integer)
    role_id        = Column(Integer)
