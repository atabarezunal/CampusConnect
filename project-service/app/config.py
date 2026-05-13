import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{os.getenv('PROJECT_DB_USER')}:{os.getenv('PROJECT_DB_PASSWORD')}@{os.getenv('PROJECT_DB_HOST')}/{os.getenv('PROJECT_DB_NAME')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET = os.getenv("JWT_SECRET")
    INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY")