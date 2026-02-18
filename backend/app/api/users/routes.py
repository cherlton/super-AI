from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.repositories.user_repository import UserRepository
from app.utils.security import hash_password, verify_password

users_bp = Blueprint("users", __name__)


@users_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """
    Get current user profile
    ---
    tags:
      - Users
    security:
      - Bearer: []
    responses:
      200:
        description: User profile retrieved
        schema:
          type: object
          properties:
            id:
              type: integer
            email:
              type: string
            created_at:
              type: string
      404:
        description: User not found
    """
    user_id = get_jwt_identity()
    user_repo = UserRepository()
    user = user_repo.get_by_id(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "email": user.email,
        "created_at": user.created_at.isoformat()
    }), 200


@users_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_current_user():
    """
    Update current user profile
    ---
    tags:
      - Users
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            email:
              type: string
              example: newemail@example.com
    responses:
      200:
        description: Profile updated successfully
      400:
        description: Email already in use
      404:
        description: User not found
    """
    user_id = get_jwt_identity()
    data = request.get_json()

    user_repo = UserRepository()
    user = user_repo.get_by_id(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    new_email = data.get("email")
    if new_email and new_email != user.email:
        existing = user_repo.get_by_email(new_email)
        if existing:
            return jsonify({"error": "Email already in use"}), 400
        user_repo.update_email(user_id, new_email)

    return jsonify({"message": "Profile updated successfully"}), 200


@users_bp.route("/me/password", methods=["PUT"])
@jwt_required()
def change_password():
    """
    Change password
    ---
    tags:
      - Users
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - current_password
            - new_password
          properties:
            current_password:
              type: string
            new_password:
              type: string
    responses:
      200:
        description: Password changed successfully
      400:
        description: Missing required fields
      401:
        description: Current password is incorrect
      404:
        description: User not found
    """
    user_id = get_jwt_identity()
    data = request.get_json()

    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return jsonify({"error": "Current and new password required"}), 400

    user_repo = UserRepository()
    user = user_repo.get_by_id(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not verify_password(current_password, user.password_hash):
        return jsonify({"error": "Current password is incorrect"}), 401

    user_repo.update_password(user_id, hash_password(new_password))
    return jsonify({"message": "Password changed successfully"}), 200


@users_bp.route("/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user_by_id(user_id: int):
    """
    Get user by ID
    ---
    tags:
      - Users
    security:
      - Bearer: []
    parameters:
      - in: path
        name: user_id
        type: integer
        required: true
    responses:
      200:
        description: User found
      404:
        description: User not found
    """
    user_repo = UserRepository()
    user = user_repo.get_by_id(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "email": user.email,
        "created_at": user.created_at.isoformat()
    }), 200


@users_bp.route("/me", methods=["DELETE"])
@jwt_required()
def delete_current_user():
    """
    Delete current user account
    ---
    tags:
      - Users
    security:
      - Bearer: []
    responses:
      200:
        description: Account deleted successfully
      404:
        description: User not found
    """
    user_id = get_jwt_identity()
    user_repo = UserRepository()
    
    user = user_repo.get_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user_repo.delete(user_id)
    return jsonify({"message": "Account deleted successfully"}), 200