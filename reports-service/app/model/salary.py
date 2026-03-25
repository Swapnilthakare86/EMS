from sqlalchemy import Column, Integer, Numeric, Date, ForeignKey
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Salary(Base):
    __tablename__ = "salary"

    salary_id       = Column(Integer, primary_key=True, index=True)
    employee_id     = Column(Integer, ForeignKey("employee.employee_id"))
    basic_salary    = Column(Numeric(10, 2))
    deductions      = Column(Numeric(10, 2))
    start_date      = Column(Date)
