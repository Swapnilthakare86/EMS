from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class MasterData(Base):
    __tablename__ = "master_data"

    master_data_id = Column(Integer, primary_key=True, index=True)
    category       = Column(String(100))
    value          = Column(String(100))
