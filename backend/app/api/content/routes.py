from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.groq_llm_service import GroqLLMService
from app.models.sql.content_script import ContentScript
from app.extensions import db
import json

content_bp = Blueprint("content", __name__)


def get_llm_service():
    """Get or create LLM service instance."""
    return GroqLLMService()


@content_bp.route("/generate", methods=["POST"])
@jwt_required()
def generate_complete_content():
    """
    Generate a complete content package with hooks, script, captions, hashtags, and thumbnails.
    ---
    tags:
      - Content Script Generator
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - topic
          properties:
            topic:
              type: string
              description: The trending topic/niche to create content about
              example: "AI productivity tools for entrepreneurs"
            platform:
              type: string
              description: Target platform (tiktok, instagram, youtube, all)
              default: "all"
            duration:
              type: integer
              description: Target video duration in seconds
              default: 60
            style:
              type: string
              description: Content style (engaging, educational, controversial, storytelling)
              default: "engaging"
            niche:
              type: string
              description: Specific niche/industry for better targeting
    responses:
      200:
        description: Complete content package generated successfully
      400:
        description: Missing required fields
      500:
        description: Content generation failed
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    topic = data.get("topic")
    if not topic:
        return jsonify({"error": "Topic is required"}), 400
    
    platform = data.get("platform", "all")
    duration = data.get("duration", 60)
    style = data.get("style", "engaging")
    niche = data.get("niche", "")
    
    try:
        llm_service = get_llm_service()
        result = llm_service.generate_complete_content(
            topic=topic,
            platform=platform,
            duration=duration,
            style=style,
            niche=niche
        )
        
        if result.get("success"):
            # Save to database
            content = ContentScript(
                user_id=user_id,
                topic=topic,
                platform=platform,
                content_style=style,
                duration=duration,
                niche=niche,
                generation_status="completed"
            )
            
            content_package = result.get("content_package", {})
            content.set_hooks(content_package.get("hooks"))
            content.set_full_script(content_package.get("script"))
            content.set_captions(content_package.get("captions"))
            content.set_hashtags(content_package.get("hashtags"))
            content.set_thumbnail_titles(content_package.get("thumbnails"))
            
            db.session.add(content)
            db.session.commit()
            
            return jsonify({
                "success": True,
                "content_id": content.id,
                "topic": topic,
                "estimated_time_saved": "4-6 hours",
                "content_package": content_package
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("error", "Generation failed")
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@content_bp.route("/hook", methods=["POST"])
@jwt_required()
def generate_hook():
    """
    Generate attention-grabbing hooks for the first 3 seconds of a video.
    ---
    tags:
      - Content Script Generator
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - topic
          properties:
            topic:
              type: string
              description: The topic to create hooks for
            platform:
              type: string
              default: "tiktok"
            style:
              type: string
              default: "engaging"
    responses:
      200:
        description: Hooks generated successfully
    """
    data = request.get_json()
    topic = data.get("topic")
    
    if not topic:
        return jsonify({"error": "Topic is required"}), 400
    
    platform = data.get("platform", "tiktok")
    style = data.get("style", "engaging")
    
    try:
        llm_service = get_llm_service()
        result = llm_service.generate_hook(topic, platform, style)
        return jsonify({"success": True, "hooks": result}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@content_bp.route("/script", methods=["POST"])
@jwt_required()
def generate_script():
    """
    Generate a complete video script with timing cues.
    ---
    tags:
      - Content Script Generator
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - topic
          properties:
            topic:
              type: string
              description: The topic for the script
            duration:
              type: integer
              default: 60
              description: Video duration in seconds
            platform:
              type: string
              default: "tiktok"
            style:
              type: string
              default: "engaging"
    responses:
      200:
        description: Script generated successfully
    """
    data = request.get_json()
    topic = data.get("topic")
    
    if not topic:
        return jsonify({"error": "Topic is required"}), 400
    
    duration = data.get("duration", 60)
    platform = data.get("platform", "tiktok")
    style = data.get("style", "engaging")
    
    try:
        llm_service = get_llm_service()
        result = llm_service.generate_full_script(topic, duration, platform, style)
        return jsonify({"success": True, "script": result}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@content_bp.route("/captions", methods=["POST"])
@jwt_required()
def generate_captions():
    """
    Generate 5 caption variations for TikTok, Instagram, and YouTube.
    ---
    tags:
      - Content Script Generator
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - topic
          properties:
            topic:
              type: string
              description: The topic for captions
            content_summary:
              type: string
              description: Brief summary of the video content
            tone:
              type: string
              default: "engaging"
    responses:
      200:
        description: Captions generated successfully
    """
    data = request.get_json()
    topic = data.get("topic")
    
    if not topic:
        return jsonify({"error": "Topic is required"}), 400
    
    content_summary = data.get("content_summary", "")
    tone = data.get("tone", "engaging")
    
    try:
        llm_service = get_llm_service()
        result = llm_service.generate_captions(topic, content_summary, tone)
        return jsonify({"success": True, "captions": result}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@content_bp.route("/hashtags", methods=["POST"])
@jwt_required()
def generate_hashtags():
    """
    Generate optimized hashtag suggestions for maximum reach.
    ---
    tags:
      - Content Script Generator
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - topic
          properties:
            topic:
              type: string
              description: The topic for hashtags
            platform:
              type: string
              default: "all"
            niche:
              type: string
              description: Specific niche/industry
    responses:
      200:
        description: Hashtags generated successfully
    """
    data = request.get_json()
    topic = data.get("topic")
    
    if not topic:
        return jsonify({"error": "Topic is required"}), 400
    
    platform = data.get("platform", "all")
    niche = data.get("niche", "")
    
    try:
        llm_service = get_llm_service()
        result = llm_service.generate_hashtags(topic, platform, niche)
        return jsonify({"success": True, "hashtags": result}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@content_bp.route("/thumbnails", methods=["POST"])
@jwt_required()
def generate_thumbnails():
    """
    Generate compelling thumbnail title ideas.
    ---
    tags:
      - Content Script Generator
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - topic
          properties:
            topic:
              type: string
              description: The topic for thumbnail titles
            video_type:
              type: string
              default: "educational"
            target_emotion:
              type: string
              default: "curiosity"
    responses:
      200:
        description: Thumbnail titles generated successfully
    """
    data = request.get_json()
    topic = data.get("topic")
    
    if not topic:
        return jsonify({"error": "Topic is required"}), 400
    
    video_type = data.get("video_type", "educational")
    target_emotion = data.get("target_emotion", "curiosity")
    
    try:
        llm_service = get_llm_service()
        result = llm_service.generate_thumbnail_titles(topic, video_type, target_emotion)
        return jsonify({"success": True, "thumbnails": result}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@content_bp.route("/history", methods=["GET"])
@jwt_required()
def get_content_history():
    """
    Get user's content generation history.
    ---
    tags:
      - Content Script Generator
    security:
      - Bearer: []
    parameters:
      - name: limit
        in: query
        type: integer
        default: 20
        description: Maximum number of items to return
      - name: offset
        in: query
        type: integer
        default: 0
        description: Offset for pagination
    responses:
      200:
        description: Content history retrieved successfully
    """
    user_id = get_jwt_identity()
    limit = request.args.get("limit", 20, type=int)
    offset = request.args.get("offset", 0, type=int)
    
    # Clamp values
    limit = min(max(1, limit), 100)
    offset = max(0, offset)
    
    contents = ContentScript.query.filter_by(user_id=user_id)\
        .order_by(ContentScript.created_at.desc())\
        .offset(offset)\
        .limit(limit)\
        .all()
    
    total = ContentScript.query.filter_by(user_id=user_id).count()
    
    # Return summary without full content (for performance)
    history = []
    for content in contents:
        history.append({
            "id": content.id,
            "topic": content.topic,
            "platform": content.platform,
            "content_style": content.content_style,
            "duration": content.duration,
            "generation_status": content.generation_status,
            "created_at": content.created_at.isoformat() if content.created_at else None
        })
    
    return jsonify({
        "success": True,
        "contents": history,
        "total": total,
        "limit": limit,
        "offset": offset
    }), 200


@content_bp.route("/<int:content_id>", methods=["GET"])
@jwt_required()
def get_content_by_id(content_id):
    """
    Get specific content by ID.
    ---
    tags:
      - Content Script Generator
    security:
      - Bearer: []
    parameters:
      - name: content_id
        in: path
        type: integer
        required: true
        description: The content ID
    responses:
      200:
        description: Content retrieved successfully
      404:
        description: Content not found
    """
    user_id = get_jwt_identity()
    
    content = ContentScript.query.filter_by(id=content_id, user_id=user_id).first()
    
    if not content:
        return jsonify({"error": "Content not found"}), 404
    
    return jsonify({
        "success": True,
        "content": content.to_dict()
    }), 200


@content_bp.route("/<int:content_id>", methods=["DELETE"])
@jwt_required()
def delete_content(content_id):
    """
    Delete specific content by ID.
    ---
    tags:
      - Content Script Generator
    security:
      - Bearer: []
    parameters:
      - name: content_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Content deleted successfully
      404:
        description: Content not found
    """
    user_id = get_jwt_identity()
    
    content = ContentScript.query.filter_by(id=content_id, user_id=user_id).first()
    
    if not content:
        return jsonify({"error": "Content not found"}), 404
    
    db.session.delete(content)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Content deleted successfully"
    }), 200


@content_bp.route("/test-connection", methods=["GET"])
@jwt_required()
def test_llm_connection():
    """
    Test the Groq LLaMA 3 API connection.
    ---
    tags:
      - Content Script Generator
    security:
      - Bearer: []
    responses:
      200:
        description: Connection test result
    """
    try:
        llm_service = get_llm_service()
        result = llm_service.test_connection()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
