import os
import requests

GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAILS_URL = "https://api.github.com/user/emails"


class GitHubOAuthService:
    def exchange_code_for_user(self, code: str) -> dict:
        """
        Exchanges OAuth code for user info.
        """
        token_response = requests.post(
            GITHUB_TOKEN_URL,
            headers={"Accept": "application/json"},
            data={
                "client_id": os.getenv("GITHUB_CLIENT_ID"),
                "client_secret": os.getenv("GITHUB_CLIENT_SECRET"),
                "code": code
            },
            timeout=5
        )

        if token_response.status_code != 200:
            raise ValueError("Failed to fetch GitHub access token")

        access_token = token_response.json().get("access_token")

        if not access_token:
            raise ValueError("Missing GitHub access token")

        headers = {"Authorization": f"Bearer {access_token}"}

        user_response = requests.get(GITHUB_USER_URL, headers=headers, timeout=5)
        emails_response = requests.get(GITHUB_EMAILS_URL, headers=headers, timeout=5)

        if user_response.status_code != 200:
            raise ValueError("Failed to fetch GitHub user")

        user = user_response.json()
        emails = emails_response.json()

        primary_email = next(
            (e["email"] for e in emails if e.get("primary")), None
        )

        return {
            "email": primary_email,
            "provider_id": str(user["id"])
        }
