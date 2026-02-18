from app.extensions import db
from datetime import datetime

class CalendarEvent(db.Model):
    """
    Model for scheduled content and planned posts.
    """
    __tablename__ = "calendar_events"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    content_script_id = db.Column(db.Integer, db.ForeignKey('content_scripts.id'), nullable=True)
    
    title = db.Column(db.String(255), nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    platform = db.Column(db.String(50), nullable=False)  # e.g., TikTok, Instagram, YouTube
    
    scheduled_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default="Planned")  # Planned, Published, Archived
    
    # AI Context
    ai_suggestion_reason = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "content_script_id": self.content_script_id,
            "title": self.title,
            "topic": self.topic,
            "platform": self.platform,
            "scheduled_time": self.scheduled_time.isoformat(),
            "status": self.status,
            "ai_suggestion_reason": self.ai_suggestion_reason,
            "created_at": self.created_at.isoformat()
        }
