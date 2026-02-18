from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.sql.alert_rule import AlertRule
from app.models.sql.user import User
from app.extensions import db
import json

alerts_bp = Blueprint("alerts", __name__)

@alerts_bp.route("/rules", methods=["POST"])
@jwt_required()
def create_alert_rule():
    """Create a new trend alert rule."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    topic = data.get("topic")
    if not topic:
        return jsonify({"error": "Topic is required"}), 400
        
    threshold = data.get("threshold_score", 70)
    channels = data.get("channels", ["email"])
    
    rule = AlertRule(
        user_id=user_id,
        topic=topic,
        threshold_score=threshold
    )
    rule.set_channels(channels)
    
    db.session.add(rule)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "rule": rule.to_dict()
    }), 201

@alerts_bp.route("/rules", methods=["GET"])
@jwt_required()
def get_alert_rules():
    """List all alert rules for the current user."""
    user_id = get_jwt_identity()
    rules = AlertRule.query.filter_by(user_id=user_id).all()
    return jsonify({
        "success": True,
        "rules": [r.to_dict() for r in rules]
    }), 200

@alerts_bp.route("/rules/<int:rule_id>", methods=["PUT"])
@jwt_required()
def update_alert_rule(rule_id):
    """Update or toggle an alert rule."""
    user_id = get_jwt_identity()
    rule = AlertRule.query.filter_by(id=rule_id, user_id=user_id).first()
    
    if not rule:
        return jsonify({"error": "Rule not found"}), 404
        
    data = request.get_json()
    if "is_active" in data:
        rule.is_active = data["is_active"]
    if "threshold_score" in data:
        rule.threshold_score = data["threshold_score"]
    if "channels" in data:
        rule.set_channels(data["channels"])
        
    db.session.commit()
    return jsonify({"success": True, "rule": rule.to_dict()}), 200

@alerts_bp.route("/rules/<int:rule_id>", methods=["DELETE"])
@jwt_required()
def delete_alert_rule(rule_id):
    """Delete an alert rule."""
    user_id = get_jwt_identity()
    rule = AlertRule.query.filter_by(id=rule_id, user_id=user_id).first()
    
    if not rule:
        return jsonify({"error": "Rule not found"}), 404
        
    db.session.delete(rule)
    db.session.commit()
    return jsonify({"success": True, "message": "Rule deleted"}), 200

@alerts_bp.route("/test-sms", methods=["POST"])
@jwt_required()
def test_sms():
    """Send a test SMS to the authenticated user."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user.phone_number:
        return jsonify({"error": "No phone number set for user"}), 400
        
    from app.services.notification_service import NotificationService
    notifier = NotificationService()
    success = notifier.send_sms(user.phone_number, "Insight Sphere: This is a test SMS alert!")
    
    return jsonify({"success": success}), 200 if success else 500
