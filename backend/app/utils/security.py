from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token

# Passwords
def hash_password(password: str) -> str:
    return generate_password_hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return check_password_hash(password_hash, password)

# JWT - using flask-jwt-extended
def create_jwt(user_id: int) -> str:
    """Create a JWT token using flask-jwt-extended."""
    # Convert user_id to string to avoid "Subject must be a string" error
    return create_access_token(identity=str(user_id))
