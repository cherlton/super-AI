from app.extensions import db
from datetime import datetime
import json


class Competitor(db.Model):
    """
    Model for storing competitor channels tracked by users.
    Supports YouTube and TikTok channels for competitive analysis.
    """
    __tablename__ = "competitors"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    
    # Channel information
    channel_id = db.Column(db.String(100), nullable=False)
    channel_name = db.Column(db.String(255), nullable=False)
    channel_url = db.Column(db.String(500), nullable=False)
    channel_thumbnail = db.Column(db.String(500), nullable=True)
    platform = db.Column(db.String(50), default="youtube")  # youtube, tiktok
    
    # Channel metrics
    subscriber_count = db.Column(db.BigInteger, default=0)
    video_count = db.Column(db.Integer, default=0)
    total_views = db.Column(db.BigInteger, default=0)
    average_views = db.Column(db.Integer, default=0)
    upload_frequency = db.Column(db.String(100), nullable=True)  # e.g., "3 videos/week"
    
    # Tracking
    is_active = db.Column(db.Boolean, default=True)
    last_synced_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    videos = db.relationship("CompetitorVideo", backref="competitor", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self, include_videos=False):
        """Convert model to dictionary for API responses."""
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "channel_id": self.channel_id,
            "channel_name": self.channel_name,
            "channel_url": self.channel_url,
            "channel_thumbnail": self.channel_thumbnail,
            "platform": self.platform,
            "subscriber_count": self.subscriber_count,
            "video_count": self.video_count,
            "total_views": self.total_views,
            "average_views": self.average_views,
            "upload_frequency": self.upload_frequency,
            "is_active": self.is_active,
            "last_synced_at": self.last_synced_at.isoformat() if self.last_synced_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
        if include_videos:
            data["videos"] = [v.to_dict() for v in self.videos.order_by(CompetitorVideo.published_at.desc()).limit(20)]
        return data

    def __repr__(self):
        return f"<Competitor {self.id}: {self.channel_name}>"


class CompetitorVideo(db.Model):
    """
    Model for storing individual competitor videos with performance metrics.
    Includes AI-powered viral analysis.
    """
    __tablename__ = "competitor_videos"

    id = db.Column(db.Integer, primary_key=True)
    competitor_id = db.Column(db.Integer, db.ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Video information
    video_id = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text, nullable=True)
    thumbnail_url = db.Column(db.String(500), nullable=True)
    video_url = db.Column(db.String(500), nullable=True)
    duration = db.Column(db.String(50), nullable=True)
    published_at = db.Column(db.DateTime, nullable=True)
    
    # Performance metrics
    views = db.Column(db.BigInteger, default=0)
    likes = db.Column(db.BigInteger, default=0)
    comments = db.Column(db.Integer, default=0)
    shares = db.Column(db.Integer, default=0)
    engagement_rate = db.Column(db.Float, default=0.0)
    
    # AI Analysis
    viral_score = db.Column(db.Integer, default=0)  # 0-100
    ai_analysis = db.Column(db.Text, nullable=True)  # JSON - why this went viral
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert model to dictionary for API responses."""
        return {
            "id": self.id,
            "competitor_id": self.competitor_id,
            "video_id": self.video_id,
            "title": self.title,
            "description": self.description[:200] if self.description else None,
            "thumbnail_url": self.thumbnail_url,
            "video_url": self.video_url,
            "duration": self.duration,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "views": self.views,
            "likes": self.likes,
            "comments": self.comments,
            "shares": self.shares,
            "engagement_rate": round(self.engagement_rate, 2),
            "viral_score": self.viral_score,
            "ai_analysis": json.loads(self.ai_analysis) if self.ai_analysis else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    def set_ai_analysis(self, analysis_dict):
        """Set AI analysis from dictionary."""
        self.ai_analysis = json.dumps(analysis_dict) if analysis_dict else None

    def calculate_engagement_rate(self):
        """Calculate engagement rate based on views."""
        if self.views > 0:
            self.engagement_rate = ((self.likes + self.comments) / self.views) * 100
        return self.engagement_rate

    def __repr__(self):
        return f"<CompetitorVideo {self.id}: {self.title[:30]}...>"
