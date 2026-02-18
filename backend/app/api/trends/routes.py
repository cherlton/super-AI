from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.agents.supervisor import SupervisorAgent

trends_bp = Blueprint("trends", __name__)

@trends_bp.route("/", methods=["POST"])
@jwt_required()
def analyze_trends():
    data = request.get_json()
    topic = data.get("topic")
    user_id = get_jwt_identity()

    supervisor = SupervisorAgent()
    result = supervisor.handle_trend_request(
        topic=topic,
        user_id=user_id
    )

    return jsonify(result), 200

