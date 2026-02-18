from flask import Blueprint, jsonify
from app.services.certification_service import CertificationService
from app.models.sql.user import User

verify_bp = Blueprint("verify", __name__)

@verify_bp.route("/<string:cert_id>", methods=["GET"])
def verify_certificate(cert_id):
    """
    Publicly verify a certificate's authenticity.
    Returns skill details, user email (partial), and verification status.
    """
    cert_service = CertificationService()
    result = cert_service.verify_authenticity(cert_id)
    
    if not result.get("valid"):
        return jsonify({
            "status": "invalid",
            "message": result.get("error", "Verification failed")
        }), 404
        
    user = User.query.get(result.get("user_id"))
    email = user.email if user else "Anonymous"
    # Partially hide email for privacy
    if "@" in email:
        parts = email.split("@")
        email = f"{parts[0][:2]}***@{parts[1]}"
        
    return jsonify({
        "status": "authentic",
        "verified_by": "Insight Sphere Blockchain-Equivalent Protocol",
        "timestamp": result.get("issued_at"),
        "certificate_holder": email,
        "skill": result.get("skill_name"),
        "digital_fingerprint": cert_id
    }), 200
