# 1. Use an official Python runtime as a base image
FROM python:3.11-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy only the requirements first (optimizes build speed)
COPY requirements.txt .

# 4. Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of your application code
COPY . .

# 6. Expose the port your app runs on (e.g., 8000 for Django/FastAPI)
EXPOSE 5000

# 7. Command to run your app
# Replace with your actual start command (e.g., "python", "manage.py", "runserver")
CMD ["python", "-m", "app.main"]