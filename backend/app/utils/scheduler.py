from flask_apscheduler import APScheduler
from app.models.sql.alert_rule import AlertRule
from app.models.sql.user import User
from app.agents.trend_agents import TrendAgent
from app.services.notification_service import NotificationService
from app.extensions import db
from datetime import datetime, timedelta
import json

scheduler = APScheduler()

def check_all_alerts(app):
    """
    Background task to check all active alert rules.
    Runs periodically (e.g., every hour).
    """
    with app.app_context():
        print(f"[{datetime.now()}] Running background trend alert check...")
        
        # 1. Fetch all active alert rules
        active_rules = AlertRule.query.filter_by(is_active=True).all()
        if not active_rules:
            return

        # 2. Group rules by topic to avoid redundant API calls
        topic_map = {}
        for rule in active_rules:
            if rule.topic not in topic_map:
                topic_map[rule.topic] = []
            topic_map[rule.topic].append(rule)

        trend_agent = TrendAgent()
        notifier = NotificationService()

        # 3. Analyze each topic
        for topic, rules in topic_map.items():
            try:
                # We use user_id=0 for background system tasks
                result = trend_agent.run(topic, user_id=0)
                virality_score = result.get("virality_score", 0)
                
                for rule in rules:
                    # Check if threshold is met
                    if virality_score >= rule.threshold_score:
                        # Throttle: Don't alert more than once every 12 hours for the same rule
                        if rule.last_triggered_at and (datetime.utcnow() - rule.last_triggered_at) < timedelta(hours=12):
                            continue
                            
                        user = User.query.get(rule.user_id)
                        if user:
                            print(f"Triggering alert for user {user.email} on topic '{topic}' (Score: {virality_score})")
                            notifier.notify_trend_alert(user, result, rule)
                            
                            # Update last triggered
                            rule.last_triggered_at = datetime.utcnow()
                            db.session.commit()
                            
            except Exception as e:
                print(f"Error checking topic '{topic}': {e}")

def init_scheduler(app):
    """Initialize and start the scheduler."""
    scheduler.init_app(app)
    
    # Add the job manually
    scheduler.add_job(
        id='check_trends_job',
        func=check_all_alerts,
        args=[app],
        trigger='interval',
        hours=1 # Check every hour
    )
    
    scheduler.start()
