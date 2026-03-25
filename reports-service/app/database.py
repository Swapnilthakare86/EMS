from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError, OperationalError
from fastapi import HTTPException
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_user     = os.getenv('DB_USER')
_password = os.getenv('DB_PASSWORD')
_host     = os.getenv('DB_HOST')
_name     = os.getenv('DB_NAME')

if not all([_user, _password, _host, _name]):
    raise RuntimeError("Missing required DB env vars: DB_USER, DB_PASSWORD, DB_HOST, DB_NAME")

DATABASE_URL = f"mysql+pymysql://{_user}:{_password}@{_host}/{_name}"

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    logger.info("Database connection established")
except OperationalError as e:
    logger.error("Failed to connect to database: %s", e)
    raise RuntimeError("Database connection failed") from e

SessionLocal = sessionmaker(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("Database session error: %s", e)
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        db.close()