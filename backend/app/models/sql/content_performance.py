from app.extensions import db
from datetime import datetime
import json


class ContentPerformance(db.Model):
    """
    Model for tracking content performance over time.
    Used for ROI tracking and proving platform recommendation value.
    """
    __tablename__ = "content_performances"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    content_script_id = db.Column(db.Integer, db.ForeignKey("content_scripts.id", ondelete="SET NULL"), nullable=True)
    
    # Content information
    title = db.Column(db.String(500), nullable=False)
    platform = db.Column(db.String(50), default="youtube")
    video_url = db.Column(db.String(500), nullable=True)
    video_id = db.Column(db.String(100), nullable=True)
    published_at = db.Column(db.DateTime, nullable=True)
    
    # Performance metrics
    views = db.Column(db.BigInteger, default=0)
    likes = db.Column(db.BigInteger, default=0)
    comments = db.Column(db.Integer, default=0)
    shares = db.Column(db.Integer, default=0)
    watch_time_hours = db.Column(db.Float, default=0.0)
    engagement_rate = db.Column(db.Float, default=0.0)
    
    # Revenue tracking
    estimated_revenue = db.Column(db.Float, default=0.0)
    cpm = db.Column(db.Float, default=0.0)
    
    # Platform recommendation tracking
    used_platform_suggestion = db.Column(db.Boolean, default=False)
    suggestion_type = db.Column(db.String(100), nullable=True)  # topic, hook, script, hashtags
    
    # Content scoring (AI pre-publish rating)
    content_score = db.Column(db.Integer, nullable=True)  # 0-100 pre-publish prediction
    actual_score = db.Column(db.Integer, nullable=True)  # 0-100 actual performance rating
    score_accuracy = db.Column(db.Float, nullable=True)  # How accurate was the prediction
    
    # A/B Testing
    ab_test_group = db.Column(db.String(50), nullable=True)  # A, B, or null
    ab_test_id = db.Column(db.String(100), nullable=True)
    
    # Historical tracking (JSON - daily snapshots)
    performance_history = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert model to dictionary for API responses."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "content_script_id": self.content_script_id,
            "title": self.title,
            "platform": self.platform,
            "video_url": self.video_url,
            "video_id": self.video_id,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "views": self.views,
            "likes": self.likes,
            "comments": self.comments,
            "shares": self.shares,
            "watch_time_hours": round(self.watch_time_hours, 2),
            "engagement_rate": round(self.engagement_rate, 2),
            "estimated_revenue": round(self.estimated_revenue, 2),
            "cpm": round(self.cpm, 2),
            "used_platform_suggestion": self.used_platform_suggestion,
            "suggestion_type": self.suggestion_type,
            "content_score": self.content_score,
            "actual_score": self.actual_score,
            "score_accuracy": round(self.score_accuracy, 2) if self.score_accuracy else None,
            "ab_test_group": self.ab_test_group,
            "ab_test_id": self.ab_test_id,
            "performance_history": json.loads(self.performance_history) if self.performance_history else [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    def calculate_engagement_rate(self):
        """Calculate engagement rate based on views."""
        if self.views > 0:
            self.engagement_rate = ((self.likes + self.comments + self.shares) / self.views) * 100
        return self.engagement_rate

    def calculate_estimated_revenue(self, cpm=4.0):
        """Estimate revenue based on views and CPM."""
        self.cpm = cpm
        self.estimated_revenue = (self.views / 1000) * cpm
        return self.estimated_revenue

    def add_performance_snapshot(self, snapshot_data):
        """Add a daily performance snapshot."""
        history = json.loads(self.performance_history) if self.performance_history else []
        snapshot_data["date"] = datetime.utcnow().isoformat()
        history.append(snapshot_data)
        # Keep last 90 days of history
        self.performance_history = json.dumps(history[-90:])

    def calculate_actual_score(self):
        """Calculate actual performance score based on metrics."""
        # Formula based on engagement rate and view velocity
        engagement_weight = min(self.engagement_rate * 10, 50)  # Max 50 points
        
        # Calculate view velocity (views per day since publish)
        if self.published_at:
            days_since_publish = max((datetime.utcnow() - self.published_at).days, 1)
            views_per_day = self.views / days_since_publish
            view_weight = min(views_per_day / 100, 50)  # Max 50 points
        else:
            view_weight = 25  # Default if no publish date
        
        self.actual_score = int(engagement_weight + view_weight)
        
        # Calculate prediction accuracy if we have both scores
        if self.content_score:
            self.score_accuracy = 100 - abs(self.content_score - self.actual_score)
        
        return self.actual_score

    def __repr__(self):
        return f"<ContentPerformance {self.id}: {self.title[:30]}...>"


class ABTest(db.Model):
    """
    Model for A/B test experiments comparing content variations.
    """
    __tablename__ = "ab_tests"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    
    # Test setup
    test_name = db.Column(db.String(255), nullable=False)
    test_description = db.Column(db.Text, nullable=True)
    test_variable = db.Column(db.String(100), nullable=True)  # hook, thumbnail, title, etc.
    
    # Content A & B
    content_a_id = db.Column(db.Integer, db.ForeignKey("content_performances.id"), nullable=True)
    content_b_id = db.Column(db.Integer, db.ForeignKey("content_performances.id"), nullable=True)
    
    # Results
    winner = db.Column(db.String(10), nullable=True)  # A, B, or tie
    confidence_level = db.Column(db.Float, nullable=True)  # Statistical significance
    results_summary = db.Column(db.Text, nullable=True)  # JSON with detailed comparison
    
    # Status
    status = db.Column(db.String(50), default="pending")  # pending, running, completed
    started_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    content_a = db.relationship("ContentPerformance", foreign_keys=[content_a_id])
    content_b = db.relationship("ContentPerformance", foreign_keys=[content_b_id])

    def to_dict(self):
        """Convert model to dictionary for API responses."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "test_name": self.test_name,
            "test_description": self.test_description,
            "test_variable": self.test_variable,
            "content_a_id": self.content_a_id,
            "content_b_id": self.content_b_id,
            "content_a": self.content_a.to_dict() if self.content_a else None,
            "content_b": self.content_b.to_dict() if self.content_b else None,
            "winner": self.winner,
            "confidence_level": round(self.confidence_level, 2) if self.confidence_level else None,
            "results_summary": json.loads(self.results_summary) if self.results_summary else None,
            "status": self.status,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    def set_results_summary(self, results):
        """Set results summary from dictionary."""
        self.results_summary = json.dumps(results) if results else None

    def __repr__(self):
        return f"<ABTest {self.id}: {self.test_name}>"
