from app.extensions import db
from datetime import datetime
import json


class Niche(db.Model):
    """
    Model for storing niche analysis results.
    Helps users discover underserved niches with high demand but low competition.
    """
    __tablename__ = "niches"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    
    # Niche information
    niche_name = db.Column(db.String(255), nullable=False)
    parent_niche = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)
    
    # Scoring (0-100)
    demand_score = db.Column(db.Integer, default=50)
    competition_score = db.Column(db.Integer, default=50)
    opportunity_score = db.Column(db.Integer, default=50)  # Calculated: high demand + low competition
    
    # Business metrics
    estimated_monthly_earnings = db.Column(db.String(100), nullable=True)  # e.g., "$1,000 - $5,000"
    growth_trend = db.Column(db.String(50), default="stable")  # rising, stable, declining
    audience_size = db.Column(db.String(100), nullable=True)  # e.g., "500K - 1M"
    
    # Related data (JSON)
    example_channels = db.Column(db.Text, nullable=True)  # JSON array of example channels
    micro_niches = db.Column(db.Text, nullable=True)  # JSON array of sub-niches
    related_niches = db.Column(db.Text, nullable=True)  # JSON array of related niches
    keywords = db.Column(db.Text, nullable=True)  # JSON array of relevant keywords
    
    # AI Analysis
    ai_analysis = db.Column(db.Text, nullable=True)  # JSON - detailed AI analysis
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert model to dictionary for API responses."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "niche_name": self.niche_name,
            "parent_niche": self.parent_niche,
            "description": self.description,
            "demand_score": self.demand_score,
            "competition_score": self.competition_score,
            "opportunity_score": self.opportunity_score,
            "estimated_monthly_earnings": self.estimated_monthly_earnings,
            "growth_trend": self.growth_trend,
            "audience_size": self.audience_size,
            "example_channels": json.loads(self.example_channels) if self.example_channels else [],
            "micro_niches": json.loads(self.micro_niches) if self.micro_niches else [],
            "related_niches": json.loads(self.related_niches) if self.related_niches else [],
            "keywords": json.loads(self.keywords) if self.keywords else [],
            "ai_analysis": json.loads(self.ai_analysis) if self.ai_analysis else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    def set_example_channels(self, channels):
        """Set example channels from list."""
        self.example_channels = json.dumps(channels) if channels else None

    def set_micro_niches(self, niches):
        """Set micro niches from list."""
        self.micro_niches = json.dumps(niches) if niches else None

    def set_related_niches(self, niches):
        """Set related niches from list."""
        self.related_niches = json.dumps(niches) if niches else None

    def set_keywords(self, keywords):
        """Set keywords from list."""
        self.keywords = json.dumps(keywords) if keywords else None

    def set_ai_analysis(self, analysis):
        """Set AI analysis from dictionary."""
        self.ai_analysis = json.dumps(analysis) if analysis else None

    def calculate_opportunity_score(self):
        """Calculate opportunity score: high demand + low competition = high opportunity."""
        # Formula: (demand * 0.6) + ((100 - competition) * 0.4)
        self.opportunity_score = int((self.demand_score * 0.6) + ((100 - self.competition_score) * 0.4))
        return self.opportunity_score

    def __repr__(self):
        return f"<Niche {self.id}: {self.niche_name}>"
