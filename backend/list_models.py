import os
from google import genai
from dotenv import load_dotenv

load_dotenv(dotenv_path="app/.env")

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

try:
    print("Listing models...")
    for model in client.models.list():
        print(f"Model ID: {model.name}")
except Exception as e:
    print(f"Error listing models: {e}")
