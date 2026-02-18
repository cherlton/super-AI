from app.extensions import db
from datetime import datetime

class OpinionAnalysis(db.Model):
    __tablename__ = "opinion_analyses"

    id = db.Column(db.Integer, primary_key=True)
    topic = db.Column(db.String(255), nullable=False)
    summary = db.Column(db.Text, nullable=False)
    sentiment_breakdown = db.Column(db.Text, nullable=False)  # JSON string
    user_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
