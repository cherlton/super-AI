import os
from google import genai

class EmbeddingService:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    def embed(self, texts: list[str]) -> list[list[float]]:
        if not texts: return []
        
        # Use the newer and more stable text-embedding-004
        result = self.client.models.embed_content(
            model="text-embedding-004", 
            contents=texts
        )
        
        # Extract the vector values from the response
        return [e.values for e in result.embeddings]