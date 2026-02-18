from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.sql.calendar_event import CalendarEvent
from app.services.scheduler_service import SchedulerService
from app.extensions import db
from datetime import datetime

calendar_bp = Blueprint("calendar", __name__)

@calendar_bp.route("/events", methods=["GET"])
@jwt_required()
def get_calendar_events():
    user_id = get_jwt_identity()
    start_date = request.args.get("start_date") # ISO format
    end_date = request.args.get("end_date")
    
    query = CalendarEvent.query.filter_by(user_id=user_id)
    
    if start_date:
        query = query.filter(CalendarEvent.scheduled_time >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(CalendarEvent.scheduled_time <= datetime.fromisoformat(end_date))
        
    events = query.order_by(CalendarEvent.scheduled_time).all()
    return jsonify({
        "success": True,
        "events": [e.to_dict() for e in events]
    }), 200

@calendar_bp.route("/events", methods=["POST"])
@jwt_required()
def create_event():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    new_event = CalendarEvent(
        user_id=user_id,
        content_script_id=data.get("content_script_id"),
        title=data.get("title"),
        topic=data.get("topic"),
        platform=data.get("platform"),
        scheduled_time=datetime.fromisoformat(data.get("scheduled_time")),
        status=data.get("status", "Planned"),
        ai_suggestion_reason=data.get("ai_suggestion_reason")
    )
    
    db.session.add(new_event)
    db.session.commit()
    
    return jsonify({"success": True, "event": new_event.to_dict()}), 201

@calendar_bp.route("/events/<int:event_id>", methods=["PUT"])
@jwt_required()
def update_event(event_id):
    user_id = get_jwt_identity()
    event = CalendarEvent.query.filter_by(id=event_id, user_id=user_id).first()
    
    if not event:
        return jsonify({"error": "Event not found"}), 404
        
    data = request.get_json()
    if "scheduled_time" in data:
        event.scheduled_time = datetime.fromisoformat(data["scheduled_time"])
    if "status" in data:
        event.status = data["status"]
    if "title" in data:
        event.title = data["title"]
        
    db.session.commit()
    return jsonify({"success": True, "event": event.to_dict()}), 200

@calendar_bp.route("/events/<int:event_id>", methods=["DELETE"])
@jwt_required()
def delete_event(event_id):
    user_id = get_jwt_identity()
    event = CalendarEvent.query.filter_by(id=event_id, user_id=user_id).first()
    
    if not event:
        return jsonify({"error": "Event not found"}), 404
        
    db.session.delete(event)
    db.session.commit()
    return jsonify({"success": True, "message": "Event deleted"}), 200

@calendar_bp.route("/suggestions", methods=["GET"])
@jwt_required()
def get_calendar_suggestions():
    niche = request.args.get("niche", "Technology")
    platform = request.args.get("platform", "TikTok")
    
    scheduler = SchedulerService()
    predicted_trends = scheduler.predict_future_trends(niche)
    best_times = scheduler.get_best_posting_times(platform)
    
    return jsonify({
        "success": True,
        "predicted_trends": predicted_trends,
        "optimal_slots": best_times
    }), 200

@calendar_bp.route("/export", methods=["GET"])
@jwt_required()
def export_calendar():
    user_id = get_jwt_identity()
    scheduler = SchedulerService()
    csv_data = scheduler.generate_csv_export(user_id)
    
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=content_calendar.csv"}
    )
