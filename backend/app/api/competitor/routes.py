from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.competitor_service import CompetitorService
from app.services.groq_llm_service import GroqLLMService
from app.models.sql.competitor import Competitor, CompetitorVideo
from app.extensions import db

competitor_bp = Blueprint("competitor", __name__)


def get_competitor_service():
    """Get or create competitor service instance."""
    return CompetitorService()


def get_llm_service():
    """Get or create LLM service instance."""
    return GroqLLMService()


@competitor_bp.route("/add", methods=["POST"])
@jwt_required()
def add_competitor():
    """
    Add a new competitor channel to track.
    ---
    tags:
      - Competitor Analysis
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - channel_url
          properties:
            channel_url:
              type: string
              description: YouTube channel URL
              example: "https://www.youtube.com/@MrBeast"
    responses:
      200:
        description: Competitor added successfully
      400:
        description: Invalid channel URL or already tracking
      500:
        description: Failed to fetch channel data
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    channel_url = data.get("channel_url")
    if not channel_url:
        return jsonify({"error": "Channel URL is required"}), 400
    
    try:
        service = get_competitor_service()
        result = service.add_competitor(user_id, channel_url)
        
        if result.get("success"):
            return jsonify(result), 200
        else:
            return jsonify(result), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@competitor_bp.route("/list", methods=["GET"])
@jwt_required()
def list_competitors():
    """
    Get all tracked competitor channels.
    ---
    tags:
      - Competitor Analysis
    security:
      - Bearer: []
    responses:
      200:
        description: List of tracked competitors
    """
    user_id = get_jwt_identity()
    
    try:
        service = get_competitor_service()
        competitors = service.get_competitor_list(user_id)
        
        return jsonify({
            "success": True,
            "competitors": competitors,
            "total": len(competitors)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@competitor_bp.route("/<int:competitor_id>", methods=["GET"])
@jwt_required()
def get_competitor(competitor_id):
    """
    Get detailed competitor information with videos.
    ---
    tags:
      - Competitor Analysis
    security:
      - Bearer: []
    parameters:
      - name: competitor_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Competitor details
      404:
        description: Competitor not found
    """
    user_id = get_jwt_identity()
    
    try:
        service = get_competitor_service()
        competitor = service.get_competitor_details(competitor_id, user_id)
        
        if competitor:
            return jsonify({
                "success": True,
                "competitor": competitor
            }), 200
        else:
            return jsonify({"error": "Competitor not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@competitor_bp.route("/<int:competitor_id>/sync", methods=["POST"])
@jwt_required()
def sync_competitor(competitor_id):
    """
    Refresh competitor data and videos.
    ---
    tags:
      - Competitor Analysis
    security:
      - Bearer: []
    parameters:
      - name: competitor_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Competitor synced successfully
      404:
        description: Competitor not found
    """
    user_id = get_jwt_identity()
    
    # Verify ownership
    competitor = Competitor.query.filter_by(id=competitor_id, user_id=user_id).first()
    if not competitor:
        return jsonify({"error": "Competitor not found"}), 404
    
    try:
        service = get_competitor_service()
        result = service.sync_competitor_videos(competitor_id)
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@competitor_bp.route("/<int:competitor_id>/viral", methods=["GET"])
@jwt_required()
def get_viral_videos(competitor_id):
    """
    Get viral videos from a competitor with AI analysis.
    ---
    tags:
      - Competitor Analysis
    security:
      - Bearer: []
    parameters:
      - name: competitor_id
        in: path
        type: integer
        required: true
      - name: min_score
        in: query
        type: integer
        default: 70
        description: Minimum viral score (0-100)
    responses:
      200:
        description: Viral videos with analysis
    """
    user_id = get_jwt_identity()
    min_score = request.args.get("min_score", 70, type=int)
    
    try:
        service = get_competitor_service()
        videos = service.get_viral_videos(competitor_id, user_id, min_score)
        
        return jsonify({
            "success": True,
            "videos": videos,
            "total": len(videos)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@competitor_bp.route("/<int:competitor_id>/viral/<int:video_id>/analyze", methods=["GET"])
@jwt_required()
def analyze_viral_video(competitor_id, video_id):
    """
    Get AI analysis of why a video went viral.
    ---
    tags:
      - Competitor Analysis
    security:
      - Bearer: []
    parameters:
      - name: competitor_id
        in: path
        type: integer
        required: true
      - name: video_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Viral analysis
      404:
        description: Video not found
    """
    user_id = get_jwt_identity()
    
    # Verify ownership
    competitor = Competitor.query.filter_by(id=competitor_id, user_id=user_id).first()
    if not competitor:
        return jsonify({"error": "Competitor not found"}), 404
    
    video = CompetitorVideo.query.filter_by(id=video_id, competitor_id=competitor_id).first()
    if not video:
        return jsonify({"error": "Video not found"}), 404
    
    try:
        llm_service = get_llm_service()
        
        video_data = {
            "title": video.title,
            "description": video.description,
            "views": video.views,
            "likes": video.likes,
            "comments": video.comments,
            "engagement_rate": video.engagement_rate
        }
        
        analysis = llm_service.analyze_viral_video(video_data)
        
        # Save analysis to video
        video.set_ai_analysis(analysis)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "video": video.to_dict(),
            "analysis": analysis
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@competitor_bp.route("/gaps", methods=["GET"])
@jwt_required()
def get_content_gaps():
    """
    Get content gap analysis comparing user to competitors.
    ---
    tags:
      - Competitor Analysis
    security:
      - Bearer: []
    responses:
      200:
        description: Content gap analysis
    """
    user_id = get_jwt_identity()
    
    try:
        service = get_competitor_service()
        gaps_data = service.get_content_gaps(user_id)
        
        # If there are enough topics, run AI analysis
        if gaps_data.get("topics_analyzed", 0) >= 5:
            llm_service = get_llm_service()
            
            # Get user's content topics (from ContentScript model)
            from app.models.sql.content_script import ContentScript
            user_content = ContentScript.query.filter_by(user_id=user_id).limit(20).all()
            user_topics = [c.topic for c in user_content]
            
            competitor_topics = [t["title"] for t in gaps_data.get("top_competitor_content", [])]
            
            ai_analysis = llm_service.analyze_content_gaps(user_topics, competitor_topics)
            gaps_data["ai_analysis"] = ai_analysis
        
        return jsonify({
            "success": True,
            "gaps": gaps_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@competitor_bp.route("/<int:competitor_id>", methods=["DELETE"])
@jwt_required()
def delete_competitor(competitor_id):
    """
    Remove a competitor from tracking.
    ---
    tags:
      - Competitor Analysis
    security:
      - Bearer: []
    parameters:
      - name: competitor_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Competitor removed successfully
      404:
        description: Competitor not found
    """
    user_id = get_jwt_identity()
    
    try:
        service = get_competitor_service()
        result = service.delete_competitor(competitor_id, user_id)
        
        if result.get("success"):
            return jsonify(result), 200
        else:
            return jsonify(result), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
