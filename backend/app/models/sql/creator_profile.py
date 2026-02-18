from datetime import datetime
from app.extensions import db
import json


class CreatorProfile(db.Model):
    """
    Creator profile for collaboration matching.
    Stores niche, audience size, content style, and collaboration preferences.
    """
    __tablename__ = "creator_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    
    # Basic Info
    display_name = db.Column(db.String(100), nullable=False)
    bio = db.Column(db.Text, nullable=True)
    profile_image_url = db.Column(db.String(500), nullable=True)
    
    # Niche & Content
    niche = db.Column(db.String(100), nullable=False)  # Primary niche
    sub_niches = db.Column(db.Text, nullable=True)  # JSON array
    content_style = db.Column(db.String(50), nullable=True)  # educational, entertainment, vlogs, etc.
    
    # Audience
    audience_size = db.Column(db.Integer, default=0)  # Total followers across platforms
    platforms = db.Column(db.Text, nullable=True)  # JSON: {"youtube": 10000, "tiktok": 5000}
    
    # Collaboration Preferences
    is_open_to_collabs = db.Column(db.Boolean, default=True)
    collab_interests = db.Column(db.Text, nullable=True)  # JSON array of collab types
    preferred_min_audience = db.Column(db.Integer, default=0)
    preferred_max_audience = db.Column(db.Integer, nullable=True)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sent_requests = db.relationship("CollabRequest", foreign_keys="CollabRequest.sender_id", backref="sender", lazy="dynamic")
    received_requests = db.relationship("CollabRequest", foreign_keys="CollabRequest.receiver_id", backref="receiver", lazy="dynamic")

    def get_sub_niches(self) -> list:
        """Get sub-niches as a list."""
        if self.sub_niches:
            try:
                return json.loads(self.sub_niches)
            except:
                return []
        return []

    def set_sub_niches(self, niches: list):
        """Set sub-niches from a list."""
        self.sub_niches = json.dumps(niches)

    def get_platforms(self) -> dict:
        """Get platforms as a dict."""
        if self.platforms:
            try:
                return json.loads(self.platforms)
            except:
                return {}
        return {}

    def set_platforms(self, platforms: dict):
        """Set platforms from a dict."""
        self.platforms = json.dumps(platforms)
        # Update total audience size
        self.audience_size = sum(platforms.values())

    def get_collab_interests(self) -> list:
        """Get collaboration interests as a list."""
        if self.collab_interests:
            try:
                return json.loads(self.collab_interests)
            except:
                return []
        return []

    def set_collab_interests(self, interests: list):
        """Set collaboration interests from a list."""
        self.collab_interests = json.dumps(interests)

    def to_dict(self, include_contact: bool = False) -> dict:
        """Convert to dictionary for API response."""
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "display_name": self.display_name,
            "bio": self.bio,
            "profile_image_url": self.profile_image_url,
            "niche": self.niche,
            "sub_niches": self.get_sub_niches(),
            "content_style": self.content_style,
            "audience_size": self.audience_size,
            "platforms": self.get_platforms(),
            "is_open_to_collabs": self.is_open_to_collabs,
            "collab_interests": self.get_collab_interests(),
            "preferred_min_audience": self.preferred_min_audience,
            "preferred_max_audience": self.preferred_max_audience,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
        return data


class CollabRequest(db.Model):
    """
    Collaboration request between creators.
    Tracks status, messages, and responses.
    """
    __tablename__ = "collab_requests"

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("creator_profiles.id"), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey("creator_profiles.id"), nullable=False)
    
    # Request Details
    status = db.Column(db.String(20), default="pending")  # pending, accepted, declined, expired
    collab_type = db.Column(db.String(50), nullable=True)  # guest appearance, joint video, shoutout, etc.
    message = db.Column(db.Text, nullable=True)  # Pitch message
    ai_generated_pitch = db.Column(db.Boolean, default=False)
    
    # Response
    response_message = db.Column(db.Text, nullable=True)
    responded_at = db.Column(db.DateTime, nullable=True)
    
    # Match data (stored at request time)
    match_score = db.Column(db.Float, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self, include_profiles: bool = False) -> dict:
        """Convert to dictionary for API response."""
        data = {
            "id": self.id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "status": self.status,
            "collab_type": self.collab_type,
            "message": self.message,
            "ai_generated_pitch": self.ai_generated_pitch,
            "response_message": self.response_message,
            "responded_at": self.responded_at.isoformat() if self.responded_at else None,
            "match_score": self.match_score,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None
        }
        
        if include_profiles:
            data["sender"] = self.sender.to_dict() if self.sender else None
            data["receiver"] = self.receiver.to_dict() if self.receiver else None
        
        return data

    def accept(self, message: str = None):
        """Accept the collaboration request."""
        self.status = "accepted"
        self.response_message = message
        self.responded_at = datetime.utcnow()

    def decline(self, message: str = None):
        """Decline the collaboration request."""
        self.status = "declined"
        self.response_message = message
        self.responded_at = datetime.utcnow()

    def is_expired(self) -> bool:
        """Check if the request has expired."""
        if self.expires_at and datetime.utcnow() > self.expires_at:
            return True
        return False
