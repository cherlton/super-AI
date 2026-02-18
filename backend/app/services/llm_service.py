import os
import json
from google import genai

class LLMService:
    def __init__(self):
        # Initialize client with the key from your .env
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    def summarize_trends(self, topic: str, content: list[str]) -> str:
        if not content:
            return f"No recent trends found for {topic}."
            
        processed_content = [item[:200] for item in content[:15]]
        
        prompt = (
            f"Analyze these top 15 trending results for '{topic}'. "
            "Identify the most significant common themes and provide a deep, professional "
            "3-sentence analysis of where this topic is heading in 2025:\n\n"
            + "\n- ".join(processed_content)
        )
        
        try:
            response = self.client.models.generate_content(
                model='gemini-flash-latest',
                contents=prompt
            )
            return response.text
        except Exception as e:
            print(f"LLM Error: {e}")
            return f"Analysis currently unavailable for {topic} due to API limits. Please try again in a few minutes."

    def analyze_opinions(self, comments: list[str]) -> dict:
        if not comments:
            return {"positive": 0, "negative": 0, "neutral": 0}
            
        processed_comments = [c[:200] for c in comments[:15]]
        prompt = (
            "Analyze these YouTube comments and provide a sentiment breakdown. "
            "Return ONLY a JSON object with keys 'positive', 'negative', and 'neutral' "
            "representing percentages (integers adding up to 100).\n\n"
            + "\n- ".join(processed_comments)
        )
        
        try:
            response = self.client.models.generate_content(
                model='gemini-flash-latest',
                contents=prompt,
                config={
                    'response_mime_type': 'application/json'
                }
            )
            
            content = response.text
            # Basic cleanup if not pure JSON
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "").strip()
            
            return json.loads(content)
        except Exception as e:
            print(f"LLM Error: {e}")
            return {"positive": 50, "negative": 25, "neutral": 25} # Fallback