from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from app.extensions import db
from app.models.sql.trend_analysis import TrendAnalysis
from app.models.sql.opinion_analysis import OpinionAnalysis
from app.models.sql.skill_path import SkillPath

dashboard_bp = Blueprint("dashboard", __name__)


def calculate_change(current_count, previous_count):
    """Calculate percentage change between two periods."""
    if previous_count == 0:
        if current_count > 0:
            return "+100%"
        return "+0%"
    
    change = ((current_count - previous_count) / previous_count) * 100
    sign = "+" if change >= 0 else ""
    return f"{sign}{change:.0f}%"


@dashboard_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_dashboard_stats():
    """
    Get dashboard statistics for the current user
    ---
    tags:
      - Dashboard
    security:
      - Bearer: []
    responses:
      200:
        description: Dashboard statistics
        schema:
          type: object
          properties:
            activeTrends:
              type: integer
              description: Number of trend analyses
            sentimentAnalyzed:
              type: integer
              description: Number of opinion/sentiment analyses
            learningPaths:
              type: integer
              description: Number of skill learning paths
            opportunities:
              type: integer
              description: Number of opportunities identified
            trendsChange:
              type: string
              description: Percentage change in trends from last period
            sentimentChange:
              type: string
              description: Percentage change in sentiment analyses
            pathsChange:
              type: string
              description: Percentage change in learning paths
            opportunitiesChange:
              type: string
              description: Percentage change in opportunities
    """
    user_id = get_jwt_identity()
    
    # Define time periods for comparison (last 30 days vs previous 30 days)
    now = datetime.utcnow()
    current_period_start = now - timedelta(days=30)
    previous_period_start = now - timedelta(days=60)
    
    # Get current period counts
    current_trends = TrendAnalysis.query.filter(
        TrendAnalysis.user_id == user_id,
        TrendAnalysis.created_at >= current_period_start
    ).count()
    
    current_sentiments = OpinionAnalysis.query.filter(
        OpinionAnalysis.user_id == user_id,
        OpinionAnalysis.created_at >= current_period_start
    ).count()
    
    current_paths = SkillPath.query.filter(
        SkillPath.user_id == user_id,
        SkillPath.created_at >= current_period_start
    ).count()
    
    # Get previous period counts for comparison
    previous_trends = TrendAnalysis.query.filter(
        TrendAnalysis.user_id == user_id,
        TrendAnalysis.created_at >= previous_period_start,
        TrendAnalysis.created_at < current_period_start
    ).count()
    
    previous_sentiments = OpinionAnalysis.query.filter(
        OpinionAnalysis.user_id == user_id,
        OpinionAnalysis.created_at >= previous_period_start,
        OpinionAnalysis.created_at < current_period_start
    ).count()
    
    previous_paths = SkillPath.query.filter(
        SkillPath.user_id == user_id,
        SkillPath.created_at >= previous_period_start,
        SkillPath.created_at < current_period_start
    ).count()
    
    # Get total counts (all time)
    total_trends = TrendAnalysis.query.filter_by(user_id=user_id).count()
    total_sentiments = OpinionAnalysis.query.filter_by(user_id=user_id).count()
    total_paths = SkillPath.query.filter_by(user_id=user_id).count()
    
    # Calculate opportunities as a derived metric
    # (e.g., opportunities = trends with potential actionable insights)
    # For now, we'll derive it from the trends count
    total_opportunities = max(0, total_trends // 2)  # Simplified: half of trends = opportunities
    current_opportunities = max(0, current_trends // 2)
    previous_opportunities = max(0, previous_trends // 2)
    
    # Calculate percentage changes
    trends_change = calculate_change(current_trends, previous_trends)
    sentiment_change = calculate_change(current_sentiments, previous_sentiments)
    paths_change = calculate_change(current_paths, previous_paths)
    opportunities_change = calculate_change(current_opportunities, previous_opportunities)
    
    return jsonify({
        "activeTrends": total_trends,
        "sentimentAnalyzed": total_sentiments,
        "learningPaths": total_paths,
        "opportunities": total_opportunities,
        "trendsChange": trends_change,
        "sentimentChange": sentiment_change,
        "pathsChange": paths_change,
        "opportunitiesChange": opportunities_change
    }), 200


def format_time_ago(dt):
    """Format datetime as a human-readable 'time ago' string."""
    now = datetime.utcnow()
    diff = now - dt
    
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return "Just now"
    elif seconds < 3600:
        minutes = int(seconds // 60)
        return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
    elif seconds < 86400:
        hours = int(seconds // 3600)
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    elif seconds < 604800:
        days = int(seconds // 86400)
        return f"{days} day{'s' if days != 1 else ''} ago"
    else:
        return dt.strftime("%b %d, %Y")


@dashboard_bp.route("/recent-activities", methods=["GET"])
@jwt_required()
def get_recent_activities():
    """
    Get recent activities for the current user
    ---
    tags:
      - Dashboard
    security:
      - Bearer: []
    parameters:
      - name: limit
        in: query
        type: integer
        default: 10
        description: Maximum number of activities to return (default 10, max 50)
    responses:
      200:
        description: List of recent activities
        schema:
          type: object
          properties:
            activities:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                    description: Activity ID
                  type:
                    type: string
                    description: Type of activity (trend, opinion, skill)
                  title:
                    type: string
                    description: Activity title/topic
                  description:
                    type: string
                    description: Brief description of the activity
                  icon:
                    type: string
                    description: Icon identifier for the activity type
                  timestamp:
                    type: string
                    description: ISO format timestamp
                  timeAgo:
                    type: string
                    description: Human-readable time ago string
            total:
              type: integer
              description: Total number of activities returned
    """
    user_id = get_jwt_identity()
    
    # Get limit from query params (default 10, max 50)
    limit = request.args.get('limit', 10, type=int)
    limit = min(max(1, limit), 50)  # Clamp between 1 and 50
    
    activities = []
    
    # Fetch recent trend analyses
    trends = TrendAnalysis.query.filter_by(user_id=user_id)\
        .order_by(TrendAnalysis.created_at.desc())\
        .limit(limit)\
        .all()
    
    for trend in trends:
        activities.append({
            "id": trend.id,
            "type": "trend",
            "title": f"Trend Analysis: {trend.topic}",
            "description": trend.summary[:100] + "..." if trend.summary and len(trend.summary) > 100 else (trend.summary or "Trend analysis completed"),
            "icon": "trending-up",
            "timestamp": trend.created_at.isoformat() if trend.created_at else None,
            "timeAgo": format_time_ago(trend.created_at) if trend.created_at else "Unknown",
            "rawTimestamp": trend.created_at
        })
    
    # Fetch recent opinion analyses
    opinions = OpinionAnalysis.query.filter_by(user_id=user_id)\
        .order_by(OpinionAnalysis.created_at.desc())\
        .limit(limit)\
        .all()
    
    for opinion in opinions:
        activities.append({
            "id": opinion.id,
            "type": "opinion",
            "title": f"Sentiment Analysis: {opinion.topic}",
            "description": opinion.summary[:100] + "..." if opinion.summary and len(opinion.summary) > 100 else (opinion.summary or "Sentiment analysis completed"),
            "icon": "message-circle",
            "timestamp": opinion.created_at.isoformat() if opinion.created_at else None,
            "timeAgo": format_time_ago(opinion.created_at) if opinion.created_at else "Unknown",
            "rawTimestamp": opinion.created_at
        })
    
    # Fetch recent skill paths
    skills = SkillPath.query.filter_by(user_id=user_id)\
        .order_by(SkillPath.created_at.desc())\
        .limit(limit)\
        .all()
    
    for skill in skills:
        activities.append({
            "id": skill.id,
            "type": "skill",
            "title": f"Learning Path: {skill.skill_name}",
            "description": f"Created a new learning path for {skill.skill_name}",
            "icon": "book-open",
            "timestamp": skill.created_at.isoformat() if skill.created_at else None,
            "timeAgo": format_time_ago(skill.created_at) if skill.created_at else "Unknown",
            "rawTimestamp": skill.created_at
        })
    
    # Sort all activities by timestamp (most recent first)
    activities.sort(key=lambda x: x.get('rawTimestamp') or datetime.min, reverse=True)
    
    # Remove rawTimestamp (internal use only) and limit to requested count
    activities = activities[:limit]
    for activity in activities:
        activity.pop('rawTimestamp', None)
    
    return jsonify({
        "activities": activities,
        "total": len(activities)
    }), 200
