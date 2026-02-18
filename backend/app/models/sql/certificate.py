from app.extensions import db
from datetime import datetime
import uuid

class Certificate(db.Model):
    """
    Model for issued certificates and skill badges.
    Contains a unique verification hash for authenticity checks.
    """
    __tablename__ = "certificates"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, nullable=False, index=True)
    skill_name = db.Column(db.String(255), nullable=False)
    
    # Cryptographic proof
    verification_hash = db.Column(db.String(255), unique=True, nullable=False)
    
    # Metadata
    issued_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "skill_name": self.skill_name,
            "verification_hash": self.verification_hash,
            "issued_at": self.issued_at.isoformat(),
            "verify_url": f"/verify/{self.id}"
        }

    def __repr__(self):
        return f"<Certificate {self.id}: {self.skill_name}>"
