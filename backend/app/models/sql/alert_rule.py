from app.extensions import db
from datetime import datetime
import json

class AlertRule(db.Model):
    """
    Model for user-defined trend alert rules.
    Users can set thresholds for virality scores and choose notification channels.
    """
    __tablename__ = "alert_rules"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    
    # Alert criteria
    topic = db.Column(db.String(255), nullable=False)
    threshold_score = db.Column(db.Integer, default=70)  # Alert when virality > 70
    
    # Notification preferences
    # Stored as JSON string: ["sms", "email", "push"]
    channels = db.Column(db.Text, default='["email"]')
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    last_triggered_at = db.Column(db.DateTime, nullable=True)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "topic": self.topic,
            "threshold_score": self.threshold_score,
            "channels": json.loads(self.channels) if self.channels else ["email"],
            "is_active": self.is_active,
            "last_triggered_at": self.last_triggered_at.isoformat() if self.last_triggered_at else None,
            "created_at": self.created_at.isoformat()
        }

    def set_channels(self, channels_list):
        self.channels = json.dumps(channels_list)

    def __repr__(self):
        return f"<AlertRule {self.id}: {self.topic} (Threshold: {self.threshold_score})>"
