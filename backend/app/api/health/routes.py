from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)

@health_bp.route("/", methods=["GET"])
def health_check():
    """
    Health check endpoint
    ---
    tags:
      - Health
    responses:
      200:
        description: Service is healthy
        schema:
          type: object
          properties:
            status:
              type: string
              example: ok
            service:
              type: string
              example: Insight-Sphere API
    """
    return jsonify({
        "status": "ok",
        "service": "Insight-Sphere API"
    }), 200