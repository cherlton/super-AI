"""
OAuth utilities for Google and GitHub authentication
"""
import os
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests


def verify_google_token(token: str) -> dict:
    """
    Verify a Google OAuth token and return user info.
    
    Handles both:
    - ID tokens (JWT with 3 segments)
    - Access tokens (starts with ya29.)
    
    Args:
        token: The Google ID token or access token from the frontend
        
    Returns:
        dict with keys: email, sub (Google user ID), name, picture, etc.
        
    Raises:
        ValueError: If the token is invalid
    """
    client_id = os.environ.get("GOOGLE_CLIENT_ID")
    if not client_id:
        raise ValueError("GOOGLE_CLIENT_ID environment variable not set")
    
    # Check if this is an access token (starts with ya29.) or ID token (JWT)
    if token.startswith("ya29."):
        # This is an access token - use userinfo endpoint
        return _verify_google_access_token(token)
    else:
        # This is an ID token - verify JWT
        return _verify_google_id_token(token, client_id)


def _verify_google_id_token(token: str, client_id: str) -> dict:
    """Verify a Google ID token (JWT)."""
    try:
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            client_id
        )
        
        # Verify the issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Invalid issuer')
        
        return {
            "email": idinfo.get("email"),
            "sub": idinfo.get("sub"),  # Google user ID
            "name": idinfo.get("name"),
            "picture": idinfo.get("picture"),
            "email_verified": idinfo.get("email_verified", False)
        }
    except Exception as e:
        raise ValueError(f"Invalid Google ID token: {str(e)}")


def _verify_google_access_token(token: str) -> dict:
    """Verify a Google access token by calling the userinfo endpoint."""
    try:
        # Use the access token to get user info from Google
        response = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code != 200:
            raise ValueError(f"Google API returned status {response.status_code}")
        
        userinfo = response.json()
        
        if "error" in userinfo:
            raise ValueError(userinfo.get("error_description", userinfo["error"]))
        
        return {
            "email": userinfo.get("email"),
            "sub": userinfo.get("sub"),  # Google user ID
            "name": userinfo.get("name"),
            "picture": userinfo.get("picture"),
            "email_verified": userinfo.get("email_verified", False)
        }
    except requests.RequestException as e:
        raise ValueError(f"Failed to verify Google access token: {str(e)}")


def exchange_github_code(code: str) -> dict:
    """
    Exchange a GitHub OAuth code for user information.
    
    Args:
        code: The authorization code from GitHub OAuth flow
        
    Returns:
        dict with keys: email, id (GitHub user ID), login (username), name, avatar_url
        
    Raises:
        ValueError: If the code exchange fails
    """
    client_id = os.environ.get("GITHUB_CLIENT_ID")
    client_secret = os.environ.get("GITHUB_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        raise ValueError("GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables must be set")
    
    # Exchange code for access token
    token_response = requests.post(
        "https://github.com/login/oauth/access_token",
        headers={"Accept": "application/json"},
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code
        }
    )
    
    if token_response.status_code != 200:
        raise ValueError("Failed to exchange GitHub code for token")
    
    token_data = token_response.json()
    
    if "error" in token_data:
        raise ValueError(f"GitHub OAuth error: {token_data.get('error_description', token_data['error'])}")
    
    access_token = token_data.get("access_token")
    if not access_token:
        raise ValueError("No access token in GitHub response")
    
    # Get user info from GitHub API
    user_response = requests.get(
        "https://api.github.com/user",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
    )
    
    if user_response.status_code != 200:
        raise ValueError("Failed to get GitHub user info")
    
    user_data = user_response.json()
    
    # Get user email if not public
    email = user_data.get("email")
    if not email:
        emails_response = requests.get(
            "https://api.github.com/user/emails",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github.v3+json"
            }
        )
        if emails_response.status_code == 200:
            emails = emails_response.json()
            # Get the primary email
            for email_obj in emails:
                if email_obj.get("primary"):
                    email = email_obj.get("email")
                    break
            # Fallback to first verified email
            if not email:
                for email_obj in emails:
                    if email_obj.get("verified"):
                        email = email_obj.get("email")
                        break
    
    if not email:
        raise ValueError("Unable to get email from GitHub account")
    
    return {
        "email": email,
        "id": str(user_data.get("id")),  # GitHub user ID as string
        "login": user_data.get("login"),
        "name": user_data.get("name"),
        "avatar_url": user_data.get("avatar_url")
    }
