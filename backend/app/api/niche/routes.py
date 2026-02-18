from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.groq_llm_service import GroqLLMService
from app.models.sql.niche import Niche
from app.extensions import db

niche_bp = Blueprint("niche", __name__)


def get_llm_service():
    """Get or create LLM service instance."""
    return GroqLLMService()


@niche_bp.route("/analyze", methods=["POST"])
@jwt_required()
def analyze_niche():
    """
    Analyze a specific niche for demand, competition, and opportunity.
    ---
    tags:
      - Niche Finder
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - niche_name
          properties:
            niche_name:
              type: string
              description: The niche to analyze
              example: "AI tools for small businesses"
            save_result:
              type: boolean
              description: Whether to save the analysis result
              default: true
    responses:
      200:
        description: Niche analysis complete
      400:
        description: Niche name required
      500:
        description: Analysis failed
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    niche_name = data.get("niche_name")
    if not niche_name:
        return jsonify({"error": "Niche name is required"}), 400
    
    save_result = data.get("save_result", True)
    
    try:
        llm_service = get_llm_service()
        analysis = llm_service.analyze_niche(niche_name)
        
        scores = analysis.get("scores", {})
        
        if save_result:
            # Save to database
            niche = Niche(
                user_id=user_id,
                niche_name=niche_name,
                description=analysis.get("description"),
                demand_score=scores.get("demand_score", 50),
                competition_score=scores.get("competition_score", 50),
                opportunity_score=scores.get("opportunity_score", 50),
                estimated_monthly_earnings=analysis.get("monetization", {}).get("estimated_monthly_earnings"),
                growth_trend=analysis.get("growth_trend", "stable"),
                audience_size=analysis.get("audience", {}).get("size_estimate")
            )
            
            niche.set_example_channels(analysis.get("example_channels", []))
            niche.set_keywords(analysis.get("content_strategy", {}).get("content_pillars", []))
            niche.set_ai_analysis(analysis)
            niche.calculate_opportunity_score()
            
            db.session.add(niche)
            db.session.commit()
            
            return jsonify({
                "success": True,
                "niche_id": niche.id,
                "analysis": analysis
            }), 200
        
        return jsonify({
            "success": True,
            "analysis": analysis
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@niche_bp.route("/explore", methods=["GET"])
@jwt_required()
def explore_niches():
    """
    Get trending and recommended niches.
    ---
    tags:
      - Niche Finder
    security:
      - Bearer: []
    responses:
      200:
        description: Trending niches list
    """
    try:
        llm_service = get_llm_service()
        trending = llm_service.explore_trending_niches()
        
        return jsonify({
            "success": True,
            "trending": trending
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@niche_bp.route("/micro", methods=["POST"])
@jwt_required()
def find_micro_niches():
    """
    Find micro-niche opportunities within a broader niche.
    ---
    tags:
      - Niche Finder
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - parent_niche
          properties:
            parent_niche:
              type: string
              description: The broader niche to explore
              example: "Personal Finance"
    responses:
      200:
        description: Micro-niche opportunities
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    parent_niche = data.get("parent_niche")
    if not parent_niche:
        return jsonify({"error": "Parent niche is required"}), 400
    
    try:
        llm_service = get_llm_service()
        micro_niches = llm_service.find_micro_niches(parent_niche)
        
        return jsonify({
            "success": True,
            "micro_niches": micro_niches
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@niche_bp.route("/related", methods=["POST"])
@jwt_required()
def find_related_niches():
    """
    Find related niches for expansion.
    ---
    tags:
      - Niche Finder
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - niche_name
          properties:
            niche_name:
              type: string
              description: Current niche
    responses:
      200:
        description: Related niche suggestions
    """
    data = request.get_json()
    
    niche_name = data.get("niche_name")
    if not niche_name:
        return jsonify({"error": "Niche name is required"}), 400
    
    try:
        llm_service = get_llm_service()
        related = llm_service.find_related_niches(niche_name)
        
        return jsonify({
            "success": True,
            "related": related
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@niche_bp.route("/<int:niche_id>", methods=["GET"])
@jwt_required()
def get_niche(niche_id):
    """
    Get a saved niche analysis.
    ---
    tags:
      - Niche Finder
    security:
      - Bearer: []
    parameters:
      - name: niche_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Niche analysis
      404:
        description: Niche not found
    """
    user_id = get_jwt_identity()
    
    niche = Niche.query.filter_by(id=niche_id, user_id=user_id).first()
    
    if not niche:
        return jsonify({"error": "Niche not found"}), 404
    
    return jsonify({
        "success": True,
        "niche": niche.to_dict()
    }), 200


@niche_bp.route("/history", methods=["GET"])
@jwt_required()
def get_niche_history():
    """
    Get user's niche research history.
    ---
    tags:
      - Niche Finder
    security:
      - Bearer: []
    parameters:
      - name: limit
        in: query
        type: integer
        default: 20
      - name: offset
        in: query
        type: integer
        default: 0
    responses:
      200:
        description: Niche history
    """
    user_id = get_jwt_identity()
    limit = request.args.get("limit", 20, type=int)
    offset = request.args.get("offset", 0, type=int)
    
    # Clamp values
    limit = min(max(1, limit), 50)
    offset = max(0, offset)
    
    niches = Niche.query.filter_by(user_id=user_id)\
        .order_by(Niche.created_at.desc())\
        .offset(offset)\
        .limit(limit)\
        .all()
    
    total = Niche.query.filter_by(user_id=user_id).count()
    
    return jsonify({
        "success": True,
        "niches": [n.to_dict() for n in niches],
        "total": total,
        "limit": limit,
        "offset": offset
    }), 200


@niche_bp.route("/<int:niche_id>", methods=["DELETE"])
@jwt_required()
def delete_niche(niche_id):
    """
    Delete a saved niche analysis.
    ---
    tags:
      - Niche Finder
    security:
      - Bearer: []
    parameters:
      - name: niche_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Niche deleted
      404:
        description: Niche not found
    """
    user_id = get_jwt_identity()
    
    niche = Niche.query.filter_by(id=niche_id, user_id=user_id).first()
    
    if not niche:
        return jsonify({"error": "Niche not found"}), 404
    
    db.session.delete(niche)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Niche deleted successfully"
    }), 200
