"""
Custom decorators for the application.
This module re-exports flask-jwt-extended's jwt_required for backward compatibility.
"""
from flask_jwt_extended import jwt_required, get_jwt_identity

# Re-export jwt_required from flask-jwt-extended for backward compatibility
# Any code importing from here will get the flask-jwt-extended version
__all__ = ['jwt_required', 'get_jwt_identity']

