import os
from twilio.rest import Client as TwilioClient
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import json

class NotificationService:
    def __init__(self):
        # Twilio setup
        self.twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")
        
        if self.twilio_sid and self.twilio_token:
            self.twilio_client = TwilioClient(self.twilio_sid, self.twilio_token)
        else:
            self.twilio_client = None

        # SendGrid setup
        self.sendgrid_key = os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("FROM_EMAIL")

    def send_sms(self, to_phone: str, message: str) -> bool:
        """Send an SMS via Twilio."""
        if not self.twilio_client or not self.twilio_phone:
            print("Twilio client not configured.")
            return False
            
        try:
            self.twilio_client.messages.create(
                body=message,
                from_=self.twilio_phone,
                to=to_phone
            )
            return True
        except Exception as e:
            print(f"Twilio SMS Error: {e}")
            return False

    def send_email(self, to_email: str, subject: str, content: str) -> bool:
        """Send an email via SendGrid."""
        if not self.sendgrid_key or not self.from_email:
            print("SendGrid not configured.")
            return False
            
        message = Mail(
            from_email=self.from_email,
            to_emails=to_email,
            subject=subject,
            html_content=content
        )
        
        try:
            sg = SendGridAPIClient(self.sendgrid_key)
            sg.send(message)
            return True
        except Exception as e:
            print(f"SendGrid Error: {e}")
            return False

    def notify_trend_alert(self, user, trend_data, alert_rule):
        """Notify user about a trend alert through their chosen channels."""
        virality_score = trend_data.get("virality_score", 0)
        topic = alert_rule.topic
        
        channels = json.loads(alert_rule.channels) if isinstance(alert_rule.channels, str) else alert_rule.channels
        
        # Prepare messages
        sms_text = f"🚀 TREND ALERT: '{topic}' is blowing up! Virality Score: {virality_score}/100. Check Insight Sphere for details."
        
        email_content = f"""
        <h1>Trend Alert for {topic}</h1>
        <p>A new trend in your niche has been detected with a high virality score!</p>
        <ul>
            <li><strong>Topic:</strong> {topic}</li>
            <li><strong>Virality Score:</strong> {virality_score}/100</li>
        </ul>
        <p>Go to your dashboard to see the full analysis and generate content scripts.</p>
        """

        results = {}
        
        if "sms" in channels and user.phone_number:
            results["sms"] = self.send_sms(user.phone_number, sms_text)
            
        if "email" in channels and user.email:
            results["email"] = self.send_email(user.email, f"Trend Alert: {topic}", email_content)
            
        return results
