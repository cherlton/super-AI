from app.extensions import db
from datetime import datetime

class TrendAnalysis(db.Model):
    __tablename__ = "trend_analyses"

    id = db.Column(db.Integer, primary_key=True)
    topic = db.Column(db.String(255), nullable=False)
    summary = db.Column(db.Text, nullable=True)
    user_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
