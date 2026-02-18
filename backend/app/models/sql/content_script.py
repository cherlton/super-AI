from app.extensions import db
from datetime import datetime
import json


class ContentScript(db.Model):
    """
    Model for storing AI-generated content scripts and social media content.
    Tracks user content history for the AI Content Script Generator feature.
    """
    __tablename__ = "content_scripts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    
    # Content metadata
    topic = db.Column(db.String(500), nullable=False)
    platform = db.Column(db.String(50), default="all")  # tiktok, instagram, youtube, all
    content_style = db.Column(db.String(50), default="engaging")
    duration = db.Column(db.Integer, default=60)  # Video duration in seconds
    niche = db.Column(db.String(255), nullable=True)
    
    # Generated content (stored as JSON text for flexibility)
    hooks = db.Column(db.Text, nullable=True)  # JSON string
    full_script = db.Column(db.Text, nullable=True)  # JSON string
    captions = db.Column(db.Text, nullable=True)  # JSON string
    hashtags = db.Column(db.Text, nullable=True)  # JSON string
    thumbnail_titles = db.Column(db.Text, nullable=True)  # JSON string
    
    # Status tracking
    generation_status = db.Column(db.String(50), default="completed")  # pending, completed, failed
    error_message = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert model to dictionary for API responses."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "topic": self.topic,
            "platform": self.platform,
            "content_style": self.content_style,
            "duration": self.duration,
            "niche": self.niche,
            "hooks": json.loads(self.hooks) if self.hooks else None,
            "full_script": json.loads(self.full_script) if self.full_script else None,
            "captions": json.loads(self.captions) if self.captions else None,
            "hashtags": json.loads(self.hashtags) if self.hashtags else None,
            "thumbnail_titles": json.loads(self.thumbnail_titles) if self.thumbnail_titles else None,
            "generation_status": self.generation_status,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    def set_hooks(self, hooks_dict):
        """Set hooks from dictionary."""
        self.hooks = json.dumps(hooks_dict) if hooks_dict else None
    
    def set_full_script(self, script_dict):
        """Set full script from dictionary."""
        self.full_script = json.dumps(script_dict) if script_dict else None
    
    def set_captions(self, captions_dict):
        """Set captions from dictionary."""
        self.captions = json.dumps(captions_dict) if captions_dict else None
    
    def set_hashtags(self, hashtags_dict):
        """Set hashtags from dictionary."""
        self.hashtags = json.dumps(hashtags_dict) if hashtags_dict else None
    
    def set_thumbnail_titles(self, thumbnails_dict):
        """Set thumbnail titles from dictionary."""
        self.thumbnail_titles = json.dumps(thumbnails_dict) if thumbnails_dict else None

    def __repr__(self):
        return f"<ContentScript {self.id}: {self.topic[:30]}...>"
