from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.collaboration_service import CollaborationService
from app.services.groq_llm_service import GroqLLMService
from app.models.sql.creator_profile import CreatorProfile, CollabRequest
from app.extensions import db

collaboration_bp = Blueprint("collaboration", __name__)


def get_collaboration_service():
    """Get or create collaboration service instance."""
    return CollaborationService()


def get_llm_service():
    """Get or create LLM service instance."""
    return GroqLLMService()


# ============ PROFILE ENDPOINTS ============

@collaboration_bp.route("/profile", methods=["POST"])
@jwt_required()
def create_or_update_profile():
    """
    Create or update the user's creator profile.
    ---
    tags:
      - Creator Collaboration
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - display_name
            - niche
          properties:
            display_name:
              type: string
            bio:
              type: string
            profile_image_url:
              type: string
            niche:
              type: string
            sub_niches:
              type: array
              items:
                type: string
            content_style:
              type: string
              enum: [educational, entertainment, vlogs, tutorials, reviews, comedy, howto]
            platforms:
              type: object
              description: "Platform name to follower count, e.g. {youtube: 10000, tiktok: 5000}"
            is_open_to_collabs:
              type: boolean
              default: true
            collab_interests:
              type: array
              items:
                type: string
              description: "Types of collabs interested in: guest appearance, joint video, shoutout, etc."
            preferred_min_audience:
              type: integer
              default: 0
            preferred_max_audience:
              type: integer
    responses:
      200:
        description: Profile created/updated successfully
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get("display_name") and not CreatorProfile.query.filter_by(user_id=user_id).first():
        return jsonify({"error": "display_name is required for new profiles"}), 400
    
    if not data.get("niche") and not CreatorProfile.query.filter_by(user_id=user_id).first():
        return jsonify({"error": "niche is required for new profiles"}), 400
    
    try:
        service = get_collaboration_service()
        result = service.get_or_create_profile(user_id, data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@collaboration_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_own_profile():
    """
    Get the current user's creator profile.
    ---
    tags:
      - Creator Collaboration
    security:
      - Bearer: []
    responses:
      200:
        description: Creator profile
      404:
        description: Profile not found
    """
    user_id = get_jwt_identity()
    
    service = get_collaboration_service()
    profile = service.get_profile_by_user(user_id)
    
    if not profile:
        return jsonify({"error": "Profile not found. Create one first."}), 404
    
    return jsonify({
        "success": True,
        "profile": profile
    }), 200


@collaboration_bp.route("/profile/<int:profile_id>", methods=["GET"])
@jwt_required()
def get_profile(profile_id):
    """
    Get another creator's public profile.
    ---
    tags:
      - Creator Collaboration
    security:
      - Bearer: []
    parameters:
      - name: profile_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Creator profile
      404:
        description: Profile not found
    """
    service = get_collaboration_service()
    profile = service.get_profile_by_id(profile_id)
    
    if not profile:
        return jsonify({"error": "Profile not found"}), 404
    
    return jsonify({
        "success": True,
        "profile": profile
    }), 200


# ============ MATCHING ENDPOINTS ============

@collaboration_bp.route("/matches", methods=["GET"])
@jwt_required()
def find_matches():
    """
    Find matching creators for collaboration.
    ---
    tags:
      - Creator Collaboration
    security:
      - Bearer: []
    parameters:
      - name: niche
        in: query
        type: string
        description: Filter by niche
      - name: min_audience
        in: query
        type: integer
        description: Minimum audience size
      - name: max_audience
        in: query
        type: integer
        description: Maximum audience size
      - name: style
        in: query
        type: string
        description: Filter by content style
      - name: limit
        in: query
        type: integer
        default: 20
    responses:
      200:
        description: List of matching creators with scores
      404:
        description: Create profile first
    """
    user_id = get_jwt_identity()
    
    # Check if user has a profile
    profile = CreatorProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({"error": "Create a profile first to find matches"}), 404
    
    filters = {}
    if request.args.get("niche"):
        filters["niche"] = request.args.get("niche")
    if request.args.get("min_audience"):
        filters["min_audience"] = request.args.get("min_audience", type=int)
    if request.args.get("max_audience"):
        filters["max_audience"] = request.args.get("max_audience", type=int)
    if request.args.get("style"):
        filters["style"] = request.args.get("style")
    
    limit = request.args.get("limit", 20, type=int)
    
    try:
        service = get_collaboration_service()
        matches = service.find_matches(user_id, filters)[:limit]
        
        return jsonify({
            "success": True,
            "matches": matches,
            "total": len(matches)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@collaboration_bp.route("/compatibility/<int:profile_id>", methods=["GET"])
@jwt_required()
def get_compatibility(profile_id):
    """
    Get AI-powered compatibility analysis with another creator.
    ---
    tags:
      - Creator Collaboration
    security:
      - Bearer: []
    parameters:
      - name: profile_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Compatibility analysis
    """
    user_id = get_jwt_identity()
    
    user_profile = CreatorProfile.query.filter_by(user_id=user_id).first()
    if not user_profile:
        return jsonify({"error": "Create a profile first"}), 404
    
    other_profile = CreatorProfile.query.get(profile_id)
    if not other_profile:
        return jsonify({"error": "Creator not found"}), 404
    
    try:
        collab_service = get_collaboration_service()
        score_data = collab_service.calculate_match_score(user_profile, other_profile)
        
        llm_service = get_llm_service()
        ai_analysis = llm_service.analyze_collab_compatibility(
            user_profile.to_dict(),
            other_profile.to_dict(),
            score_data["total_score"]
        )
        
        return jsonify({
            "success": True,
            "match_score": score_data,
            "ai_analysis": ai_analysis
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============ REQUEST ENDPOINTS ============

@collaboration_bp.route("/request", methods=["POST"])
@jwt_required()
def send_request():
    """
    Send a collaboration request to another creator.
    ---
    tags:
      - Creator Collaboration
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - receiver_id
          properties:
            receiver_id:
              type: integer
              description: Target creator's profile ID
            collab_type:
              type: string
              description: "guest appearance, joint video, shoutout, etc."
            message:
              type: string
              description: Pitch message
            ai_generated_pitch:
              type: boolean
              default: false
    responses:
      200:
        description: Request sent successfully
      400:
        description: Invalid request
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    receiver_id = data.get("receiver_id")
    if not receiver_id:
        return jsonify({"error": "receiver_id is required"}), 400
    
    try:
        service = get_collaboration_service()
        result = service.send_collab_request(user_id, receiver_id, data)
        
        if result.get("success"):
            return jsonify(result), 200
        else:
            return jsonify(result), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@collaboration_bp.route("/requests", methods=["GET"])
@jwt_required()
def get_requests():
    """
    Get pending collaboration requests.
    ---
    tags:
      - Creator Collaboration
    security:
      - Bearer: []
    parameters:
      - name: direction
        in: query
        type: string
        enum: [incoming, outgoing, both]
        default: both
    responses:
      200:
        description: Pending requests
    """
    user_id = get_jwt_identity()
    direction = request.args.get("direction", "both")
    
    try:
        service = get_collaboration_service()
        requests = service.get_pending_requests(user_id, direction)
        
        return jsonify({
            "success": True,
            **requests
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@collaboration_bp.route("/request/<int:request_id>", methods=["PUT"])
@jwt_required()
def respond_to_request(request_id):
    """
    Accept or decline a collaboration request.
    ---
    tags:
      - Creator Collaboration
    security:
      - Bearer: []
    parameters:
      - name: request_id
        in: path
        type: integer
        required: true
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - accept
          properties:
            accept:
              type: boolean
            message:
              type: string
              description: Optional response message
    responses:
      200:
        description: Response recorded
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if "accept" not in data:
        return jsonify({"error": "accept field is required"}), 400
    
    try:
        service = get_collaboration_service()
        result = service.respond_to_request(
            request_id,
            user_id,
            data.get("accept"),
            data.get("message")
        )
        
        if result.get("success"):
            return jsonify(result), 200
        else:
            return jsonify(result), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@collaboration_bp.route("/history", methods=["GET"])
@jwt_required()
def get_history():
    """
    Get collaboration history (completed requests).
    ---
    tags:
      - Creator Collaboration
    security:
      - Bearer: []
    parameters:
      - name: limit
        in: query
        type: integer
        default: 20
    responses:
      200:
        description: Collaboration history
    """
    user_id = get_jwt_identity()
    limit = request.args.get("limit", 20, type=int)
    
    try:
        service = get_collaboration_service()
        history = service.get_collab_history(user_id, limit)
        
        return jsonify({
            "success": True,
            "history": history,
            "total": len(history)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============ AI GENERATION ENDPOINTS ============

@collaboration_bp.route("/pitch", methods=["POST"])
@jwt_required()
def generate_pitch():
    """
    Generate AI-powered pitch templates for a collaboration.
    ---
    tags:
      - Creator Collaboration
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - receiver_id
          properties:
            receiver_id:
              type: integer
              description: Target creator's profile ID
    responses:
      200:
        description: Generated pitch templates
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    receiver_id = data.get("receiver_id")
    if not receiver_id:
        return jsonify({"error": "receiver_id is required"}), 400
    
    sender_profile = CreatorProfile.query.filter_by(user_id=user_id).first()
    if not sender_profile:
        return jsonify({"error": "Create a profile first"}), 404
    
    receiver_profile = CreatorProfile.query.get(receiver_id)
    if not receiver_profile:
        return jsonify({"error": "Creator not found"}), 404
    
    try:
        llm_service = get_llm_service()
        pitch = llm_service.generate_pitch_template(
            sender_profile.to_dict(),
            receiver_profile.to_dict()
        )
        
        return jsonify({
            "success": True,
            "pitch": pitch
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@collaboration_bp.route("/ideas", methods=["POST"])
@jwt_required()
def generate_ideas():
    """
    Generate collaboration ideas for two creators.
    ---
    tags:
      - Creator Collaboration
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - profile_id
          properties:
            profile_id:
              type: integer
              description: Other creator's profile ID
    responses:
      200:
        description: Generated collaboration ideas
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    profile_id = data.get("profile_id")
    if not profile_id:
        return jsonify({"error": "profile_id is required"}), 400
    
    user_profile = CreatorProfile.query.filter_by(user_id=user_id).first()
    if not user_profile:
        return jsonify({"error": "Create a profile first"}), 404
    
    other_profile = CreatorProfile.query.get(profile_id)
    if not other_profile:
        return jsonify({"error": "Creator not found"}), 404
    
    try:
        llm_service = get_llm_service()
        ideas = llm_service.generate_collab_ideas(
            user_profile.to_dict(),
            other_profile.to_dict()
        )
        
        return jsonify({
            "success": True,
            "ideas": ideas
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
