from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.agents.supervisor import SupervisorAgent
from app.models.sql.skill_path import SkillPath
from app.models.sql.certificate import Certificate
from app.models.sql.user import User
from app.services.certification_service import CertificationService
from app.extensions import db
from datetime import datetime
import json

skills_bp = Blueprint("skills", __name__)

@skills_bp.route("/", methods=["POST"])
@jwt_required()
def build_skill_path():
    data = request.get_json()
    skill = data.get("skill")
    user_id = get_jwt_identity()

    supervisor = SupervisorAgent()
    result = supervisor.handle_skill_request(
        skill=skill,
        user_id=user_id
    )

    return jsonify(result), 200

@skills_bp.route("/history", methods=["GET"])
@jwt_required()
def get_skill_history():
    user_id = get_jwt_identity()
    paths = SkillPath.query.filter_by(user_id=user_id).all()
    
    result = []
    for p in paths:
        steps = json.loads(p.steps) if isinstance(p.steps, str) else p.steps
        result.append({
            "id": p.id,
            "skill_name": p.skill_name,
            "is_completed": p.is_completed,
            "step_count": len(steps),
            "created_at": p.created_at.isoformat()
        })
    return jsonify({"success": True, "skills": result}), 200

@skills_bp.route("/<int:skill_id>", methods=["GET"])
@jwt_required()
def get_skill_details(skill_id):
    user_id = get_jwt_identity()
    path = SkillPath.query.filter_by(id=skill_id, user_id=user_id).first()
    
    if not path:
        return jsonify({"error": "Skill path not found"}), 404
        
    return jsonify({
        "success": True,
        "skill": {
            "id": path.id,
            "skill_name": path.skill_name,
            "steps": json.loads(path.steps) if isinstance(path.steps, str) else path.steps,
            "is_completed": path.is_completed,
            "completed_at": path.completed_at.isoformat() if path.completed_at else None
        }
    }), 200

@skills_bp.route("/<int:skill_id>/submit-quiz", methods=["POST"])
@jwt_required()
def submit_quiz_step(skill_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    step_index = data.get("step_index") # 0, 1, 2...
    answers = data.get("answers") # list of indices [0, 2, 1]
    
    path = SkillPath.query.filter_by(id=skill_id, user_id=user_id).first()
    if not path:
        return jsonify({"error": "Skill path not found"}), 404
        
    steps = json.loads(path.steps) if isinstance(path.steps, str) else path.steps
    if step_index >= len(steps):
        return jsonify({"error": "Invalid step index"}), 400
        
    step = steps[step_index]
    quiz = step.get("quiz", {})
    correct_indices = [q.get("correct_index") for q in quiz.get("questions", [])]
    
    # Calculate score
    correct_count = 0
    for i, user_ans in enumerate(answers):
        if i < len(correct_indices) and user_ans == correct_indices[i]:
            correct_count += 1
            
    score_pct = (correct_count / len(correct_indices)) * 100 if correct_indices else 0
    passed = score_pct >= 70 # 70% to pass
    
    if passed:
        # Mark step as completed
        steps[step_index]["completed"] = True
        path.steps = json.dumps(steps)
        
        # Check if all steps are now completed
        all_done = all([s.get("completed", False) for s in steps])
        if all_done:
            path.is_completed = True
            path.completed_at = datetime.utcnow()
            
            # Issue certificate
            cert_service = CertificationService()
            cert = cert_service.issue_certificate(user_id, path.skill_name)
            
            db.session.commit()
            return jsonify({
                "success": True, 
                "passed": True, 
                "score": score_pct,
                "message": "Step completed!",
                "certificate_issued": True,
                "certificate": cert.to_dict(),
                "linkedin_url": cert_service.generate_linkedin_share_url(cert)
            }), 200
            
        db.session.commit()
        return jsonify({"success": True, "passed": True, "score": score_pct, "message": "Step completed!"}), 200
    
    return jsonify({
        "success": True, 
        "passed": False, 
        "score": score_pct, 
        "message": "Assessment failed. Please review the content and try again.",
        "correct_answers": correct_indices
    }), 200

@skills_bp.route("/leaderboard", methods=["GET"])
@jwt_required()
def get_leaderboard():
    """Rank users by number of certificates earned."""
    # Group by user_id and count certificates
    ranks = db.session.query(
        Certificate.user_id, 
        db.func.count(Certificate.id).label('cert_count')
    ).group_by(Certificate.user_id).order_by(db.text('cert_count DESC')).limit(10).all()
    
    leaderboard = []
    for user_id, count in ranks:
        user = User.query.get(user_id)
        leaderboard.append({
            "email": user.email if user else "Anonymous",
            "certifications": count,
            "rank": len(leaderboard) + 1
        })
        
    return jsonify({"success": True, "leaderboard": leaderboard}), 200

@skills_bp.route("/certificates", methods=["GET"])
@jwt_required()
def get_user_certificates():
    user_id = get_jwt_identity()
    certs = Certificate.query.filter_by(user_id=user_id).all()
    cert_service = CertificationService()
    
    return jsonify({
        "success": True,
        "certificates": [
            {
                **c.to_dict(),
                "linkedin_url": cert_service.generate_linkedin_share_url(c)
            } for c in certs
        ]
    }), 200
