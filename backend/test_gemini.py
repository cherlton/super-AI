import os
from google import genai
from dotenv import load_dotenv

load_dotenv(dotenv_path="app/.env")

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

try:
    print("Testing gemini-flash-latest...")
    response = client.models.generate_content(
        model='gemini-flash-latest',
        contents="Hello, how are you?"
    )
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
