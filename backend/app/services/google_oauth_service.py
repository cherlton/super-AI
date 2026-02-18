import os
import requests

GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"


class GoogleOAuthService:
    def verify_id_token(self, id_token: str) -> dict:
        """
        Verifies a Google ID token and returns user info.
        Raises ValueError if invalid.
        """
        response = requests.get(
            GOOGLE_TOKEN_INFO_URL,
            params={"id_token": id_token},
            timeout=5
        )

        if response.status_code != 200:
            raise ValueError("Invalid Google token")

        data = response.json()

        if data.get("aud") != os.getenv("GOOGLE_CLIENT_ID"):
            raise ValueError("Token audience mismatch")

        return {
            "email": data["email"],
            "provider_id": data["sub"]
        }
