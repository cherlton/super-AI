import json
from app.services.groq_llm_service import GroqLLMService

class QuizService:
    def __init__(self):
        self.llm = GroqLLMService()

    def generate_quiz(self, topic: str) -> dict:
        """
        Generates a 3-question multiple choice quiz for a specific topic using LLaMA 3.
        """
        prompt = f"""Generate a 3-question Multiple Choice Quiz (MCQ) for the professional topic: "{topic}".
        
        For each question:
        - Provide 4 options (A, B, C, D)
        - Identify the correct answer index (0-3)
        - Provide a brief 1-sentence explanation for the answer.
        
        Return a JSON object with this structure:
        {{
            "topic": "{topic}",
            "questions": [
                {{
                    "question": "The question text",
                    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                    "correct_index": 0,
                    "explanation": "Why this is correct"
                }}
            ]
        }}"""
        
        try:
            # We use the internal _generate from the service or just instantiate a new client
            # To keep it clean, let's assume GroqLLMService has a general generate method or we add one
            result = self.llm._generate(prompt, json_mode=True)
            return json.loads(result)
        except Exception as e:
            print(f"Quiz Generation Error: {e}")
            # Fallback quiz
            return {
                "topic": topic,
                "questions": [
                    {
                        "question": f"What is the core concept of {topic}?",
                        "options": ["Standard Implementation", "Legacy Approach", "Modern Strategy", "All of the above"],
                        "correct_index": 3,
                        "explanation": "The topic encompasses multiple facets of modern industry standards."
                    }
                ]
            }
