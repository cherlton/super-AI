from datetime import datetime
from app.extensions import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)

    password_hash = db.Column(db.String(255), nullable=True)

    provider = db.Column(db.String(50), nullable=False, default="local")
    provider_id = db.Column(db.String(255), nullable=True)
    phone_number = db.Column(db.String(20), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)