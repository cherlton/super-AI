from flask import Blueprint, request, jsonify
from app.repositories.user_repository import UserRepository
from app.utils.security import (
    hash_password,
    verify_password,
    create_jwt
)

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              example: user@example.com
            password:
              type: string
              example: securepassword123
    responses:
      201:
        description: User registered successfully
        schema:
          type: object
          properties:
            token:
              type: string
      400:
        description: Validation error or user already exists
    """
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user_repo = UserRepository()

    if user_repo.get_by_email(email):
        return jsonify({"error": "User already exists"}), 400

    user = user_repo.create(
        email=email,
        password_hash=hash_password(password)
    )

    token = create_jwt(user.id)
    return jsonify({"token": token}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login user
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              example: user@example.com
            password:
              type: string
              example: securepassword123
    responses:
      200:
        description: Login successful
        schema:
          type: object
          properties:
            token:
              type: string
      401:
        description: Invalid credentials
    """
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user_repo = UserRepository()
    user = user_repo.get_by_email(email)

    if not user or not verify_password(password, user.password_hash):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_jwt(user.id)
    return jsonify({"token": token})


@auth_bp.route("/google", methods=["POST"])
def google_login():
    """
    Login with Google OAuth
    ---
    tags:
      - Authentication
    responses:
      200:
        description: Google login successful
      401:
        description: Invalid Google token
    """
    from app.utils.oauth import verify_google_token
    
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401
    
    token = auth_header.split(" ")[1]
    
    try:
        google_user = verify_google_token(token)
    except Exception as e:
        return jsonify({"error": f"Invalid Google token: {str(e)}"}), 401

    user_repo = UserRepository()
    user = user_repo.get_or_create_oauth_user(
        email=google_user["email"],
        provider="google",
        provider_id=google_user["sub"]
    )

    jwt_token = create_jwt(user.id)
    return jsonify({"token": jwt_token})


@auth_bp.route("/github", methods=["POST"])
def github_login():
    """
    Login with GitHub OAuth
    ---
    tags:
      - Authentication
    responses:
      200:
        description: GitHub login successful
      401:
        description: Invalid GitHub code
    """
    from app.utils.oauth import exchange_github_code
    
    code = request.json.get("code")
    if not code:
        return jsonify({"error": "Missing GitHub code"}), 400

    try:
        github_user = exchange_github_code(code)
    except Exception as e:
        return jsonify({"error": f"GitHub authentication failed: {str(e)}"}), 401

    user_repo = UserRepository()
    user = user_repo.get_or_create_oauth_user(
        email=github_user["email"],
        provider="github",
        provider_id=github_user["id"]
    )

    jwt_token = create_jwt(user.id)
    return jsonify({"token": jwt_token})
