import json
import csv
import io
from datetime import datetime, timedelta
from app.services.groq_llm_service import GroqLLMService
from app.models.sql.calendar_event import CalendarEvent
from app.extensions import db

class SchedulerService:
    def __init__(self):
        self.llm = GroqLLMService()

    def get_best_posting_times(self, platform: str) -> list:
        """
        Suggest optimal posting slots based on platform engagement benchmarks.
        """
        # Hardcoded benchmarks based on industry standards for 2024
        benchmarks = {
            "TikTok": ["18:00", "21:00", "02:00"],
            "Instagram": ["11:00", "13:00", "19:00"],
            "YouTube": ["15:00", "17:00", "20:00"]
        }
        
        times = benchmarks.get(platform, ["12:00", "18:00"])
        now = datetime.now()
        
        suggestions = []
        for i in range(1, 4): # Suggest for next 3 days
            date = now + timedelta(days=i)
            for t in times:
                dt_str = f"{date.strftime('%Y-%m-%d')} {t}"
                suggestions.append(dt_str)
                
        return suggestions

    def predict_future_trends(self, niche: str) -> list:
        """
        Use LLaMA 3 to predict what will be trending in 7-14 days.
        """
        prompt = f"""Based on current viral trajectories in the '{niche}' niche, predict 3 topics that are likely to peak in popularity 7-14 days from now.
        
        Provide a title, a brief prediction rationale, and a suggested platform for each.
        
        Return a JSON array of objects:
        [
            {{
                "topic": "Predicted Topic",
                "reason": "Why it will trend based on momentum",
                "peak_in": "7-10",
                "suggested_platform": "TikTok"
            }}
        ]"""
        
        try:
            result = self.llm._generate(prompt, json_mode=True)
            data = json.loads(result)
            
            # Extract list if LLM wrapped it in an object
            if isinstance(data, dict):
                for val in data.values():
                    if isinstance(val, list):
                        return val
                return [data] # Wrap single object in list
            
            return data if isinstance(data, list) else []
        except Exception as e:
            print(f"Trend Prediction Error: {e}")
            return [
                {
                    "topic": f"Evolving patterns in {niche}",
                    "reason": "Seasonal shifts and current discourse suggest a surge in interest.",
                    "peak_in": "10-14",
                    "suggested_platform": "YouTube"
                }
            ]

    def generate_csv_export(self, user_id: int) -> str:
        """
        Generate a CSV string of the user's content calendar.
        """
        events = CalendarEvent.query.filter_by(user_id=user_id).order_by(CalendarEvent.scheduled_time).all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow(["ID", "Title", "Topic", "Platform", "Scheduled Time", "Status"])
        
        for event in events:
            writer.writerow([
                event.id,
                event.title,
                event.topic,
                event.platform,
                event.scheduled_time.strftime("%Y-%m-%d %H:%M"),
                event.status
            ])
            
        return output.getvalue()
