from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.analytics_service import AnalyticsService
from app.services.groq_llm_service import GroqLLMService
from app.models.sql.content_performance import ContentPerformance, ABTest
from app.extensions import db

analytics_bp = Blueprint("analytics", __name__)


def get_analytics_service():
    """Get or create analytics service instance."""
    return AnalyticsService()


def get_llm_service():
    """Get or create LLM service instance."""
    return GroqLLMService()


@analytics_bp.route("/track", methods=["POST"])
@jwt_required()
def track_content():
    """
    Track or update content performance data.
    ---
    tags:
      - Analytics & ROI
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - title
          properties:
            title:
              type: string
            video_url:
              type: string
            video_id:
              type: string
            platform:
              type: string
              default: youtube
            views:
              type: integer
            likes:
              type: integer
            comments:
              type: integer
            shares:
              type: integer
            watch_time_hours:
              type: number
            used_platform_suggestion:
              type: boolean
              default: false
            suggestion_type:
              type: string
              description: "topic, hook, script, hashtags, or null"
            content_script_id:
              type: integer
            published_at:
              type: string
              format: date-time
            cpm:
              type: number
              default: 4.0
    responses:
      200:
        description: Content tracked successfully
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get("title"):
        return jsonify({"error": "Title is required"}), 400
    
    try:
        service = get_analytics_service()
        result = service.track_content_performance(user_id, data)
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/roi", methods=["GET"])
@jwt_required()
def get_roi():
    """
    Get ROI analysis comparing content with/without platform suggestions.
    ---
    tags:
      - Analytics & ROI
    security:
      - Bearer: []
    parameters:
      - name: days
        in: query
        type: integer
        default: 30
        description: Analysis period in days
    responses:
      200:
        description: ROI analysis
    """
    user_id = get_jwt_identity()
    days = request.args.get("days", 30, type=int)
    
    try:
        service = get_analytics_service()
        roi = service.get_roi_analysis(user_id, days)
        
        return jsonify({
            "success": True,
            "roi": roi
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/score", methods=["POST"])
@jwt_required()
def score_content():
    """
    Score content before postin        const result = await createOrUpdateCreatorProfile(data);
g with AI predictions.
    ---
    tags:
      - Analytics & ROI
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            title:
              type: string
            hook:
              type: string
            description:
              type: string
            thumbnail_text:
              type: string
            platform:
              type: string
              default: youtube
            niche:
              type: string
    responses:
      200:
        description: Content score and suggestions
    """
    data = request.get_json()
    
    try:
        llm_service = get_llm_service()
        score_result = llm_service.score_content_before_posting(data)
        
        return jsonify({
            "success": True,
            "score": score_result
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/report/weekly", methods=["GET"])
@jwt_required()
def get_weekly_report():
    """
    Get weekly performance report with AI insights.
    ---
    tags:
      - Analytics & ROI
    security:
      - Bearer: []
    responses:
      200:
        description: Weekly performance report
    """
    user_id = get_jwt_identity()
    
    try:
        service = get_analytics_service()
        report = service.get_weekly_report(user_id)
        
        # Add AI insights if enough data
        if report.get("this_week", {}).get("content_count", 0) >= 2:
            llm_service = get_llm_service()
            
            performance_data = {
                "this_week": report.get("this_week"),
                "last_week": report.get("last_week"),
                "top_content": [
                    {
                        "title": c.get("title"),
                        "views": c.get("views"),
                        "engagement_rate": c.get("engagement_rate")
                    }
                    for c in report.get("top_performing_content", [])
                ]
            }
            
            ai_insights = llm_service.generate_weekly_insights(performance_data)
            report["ai_insights"] = ai_insights
        
        return jsonify({
            "success": True,
            "report": report
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/ab-test", methods=["POST"])
@jwt_required()
def create_ab_test():
    """
    Create a new A/B test comparing two content pieces.
    ---
    tags:
      - Analytics & ROI
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - test_name
            - content_a_id
            - content_b_id
          properties:
            test_name:
              type: string
            test_description:
              type: string
            test_variable:
              type: string
              description: "hook, thumbnail, title, etc."
            content_a_id:
              type: integer
            content_b_id:
              type: integer
    responses:
      200:
        description: A/B test created
      400:
        description: Missing required fields
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get("test_name") or not data.get("content_a_id") or not data.get("content_b_id"):
        return jsonify({"error": "test_name, content_a_id, and content_b_id are required"}), 400
    
    try:
        service = get_analytics_service()
        result = service.create_ab_test(user_id, data)
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/ab-test/<int:test_id>", methods=["GET"])
@jwt_required()
def get_ab_test(test_id):
    """
    Get A/B test results.
    ---
    tags:
      - Analytics & ROI
    security:
      - Bearer: []
    parameters:
      - name: test_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: A/B test results
      404:
        description: Test not found
    """
    user_id = get_jwt_identity()
    
    try:
        service = get_analytics_service()
        result = service.get_ab_test_results(test_id, user_id)
        
        if result:
            return jsonify({
                "success": True,
                "ab_test": result
            }), 200
        else:
            return jsonify({"error": "A/B test not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/ab-test/list", methods=["GET"])
@jwt_required()
def list_ab_tests():
    """
    List all A/B tests for the user.
    ---
    tags:
      - Analytics & ROI
    security:
      - Bearer: []
    responses:
      200:
        description: List of A/B tests
    """
    user_id = get_jwt_identity()
    
    tests = ABTest.query.filter_by(user_id=user_id)\
        .order_by(ABTest.created_at.desc())\
        .all()
    
    return jsonify({
        "success": True,
        "ab_tests": [t.to_dict() for t in tests],
        "total": len(tests)
    }), 200


@analytics_bp.route("/ab-test/suggest", methods=["POST"])
@jwt_required()
def suggest_ab_tests():
    """
    Get AI suggestions for A/B tests.
    ---
    tags:
      - Analytics & ROI
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        schema:
          type: object
          properties:
            content_type:
              type: string
              default: video
            niche:
              type: string
            current_approach:
              type: string
            goal:
              type: string
    responses:
      200:
        description: A/B test suggestions
    """
    data = request.get_json() or {}
    
    try:
        llm_service = get_llm_service()
        suggestions = llm_service.suggest_ab_tests(data)
        
        return jsonify({
            "success": True,
            "suggestions": suggestions
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/revenue", methods=["GET"])
@jwt_required()
def get_revenue_attribution():
    """
    Get revenue attribution by suggestion type.
    ---
    tags:
      - Analytics & ROI
    security:
      - Bearer: []
    parameters:
      - name: days
        in: query
        type: integer
        default: 30
    responses:
      200:
        description: Revenue attribution breakdown
    """
    user_id = get_jwt_identity()
    days = request.args.get("days", 30, type=int)
    
    try:
        service = get_analytics_service()
        revenue = service.get_revenue_attribution(user_id, days)
        
        return jsonify({
            "success": True,
            "revenue": revenue
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/history", methods=["GET"])
@jwt_required()
def get_content_history():
    """
    Get tracked content history.
    ---
    tags:
      - Analytics & ROI
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
        description: Content performance history
    """
    user_id = get_jwt_identity()
    limit = request.args.get("limit", 20, type=int)
    offset = request.args.get("offset", 0, type=int)
    
    try:
        service = get_analytics_service()
        history = service.get_user_content_history(user_id, limit, offset)
        
        return jsonify({
            "success": True,
            **history
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
