import hmac
import hashlib
import os
from app.models.sql.certificate import Certificate
from app.extensions import db
from urllib.parse import quote

class CertificationService:
    def __init__(self):
        self.secret_key = os.getenv("SECRET_KEY", "dev-secret-key").encode()

    def generate_verification_hash(self, user_id: int, skill_name: str) -> str:
        """Create a unique, tamper-proof signature for the certificate."""
        message = f"{user_id}:{skill_name}".encode()
        return hmac.new(self.secret_key, message, hashlib.sha256).hexdigest()

    def issue_certificate(self, user_id: int, skill_name: str) -> Certificate:
        """Issue a new certificate and save it to the database."""
        # Check if already exists
        existing = Certificate.query.filter_by(user_id=user_id, skill_name=skill_name).first()
        if existing:
            return existing
            
        v_hash = self.generate_verification_hash(user_id, skill_name)
        
        cert = Certificate(
            user_id=user_id,
            skill_name=skill_name,
            verification_hash=v_hash
        )
        
        db.session.add(cert)
        db.session.commit()
        return cert

    def generate_linkedin_share_url(self, cert: Certificate) -> str:
        """
        Generate a URL to add the certification to LinkedIn.
        Params:
        name: Skill Name
        organizationName: Insight Sphere
        issueYear: YYYY
        issueMonth: MM
        certUrl: Public verification URL
        certId: Certificate ID
        """
        base_url = "https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME"
        name = quote(cert.skill_name)
        org = quote("Insight Sphere")
        cert_id = cert.id
        # Assuming we are on localhost for dev, but in prod this would be your domain
        verify_url = quote(f"http://localhost:5000/verify/{cert_id}")
        
        now = cert.issued_at
        
        return f"{base_url}&name={name}&organizationName={org}&issueYear={now.year}&issueMonth={now.month}&certUrl={verify_url}&certId={cert_id}"

    def verify_authenticity(self, cert_id: str) -> dict:
        """Check if a certificate's hash matches its data."""
        cert = Certificate.query.get(cert_id)
        if not cert:
            return {"valid": False, "error": "Certificate not found"}
            
        expected_hash = self.generate_verification_hash(cert.user_id, cert.skill_name)
        
        if hmac.compare_digest(cert.verification_hash, expected_hash):
            return {
                "valid": True,
                "skill_name": cert.skill_name,
                "user_id": cert.user_id,
                "issued_at": cert.issued_at.isoformat()
            }
        else:
            return {"valid": False, "error": "Invalid verification hash (Tampered)"}
