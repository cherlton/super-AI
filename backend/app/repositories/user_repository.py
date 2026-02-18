from app.models.sql.user import User
from app.extensions import db
from typing import Optional


class UserRepository:

    def get_by_email(self, email: str) -> Optional[User]:
        """Get a user by email address."""
        return User.query.filter_by(email=email).first()

    def get_by_id(self, user_id: int) -> Optional[User]:
        """Get a user by ID."""
        return User.query.get(user_id)

    def get_by_provider(self, provider: str, provider_id: str) -> Optional[User]:
        """Get a user by OAuth provider and provider ID."""
        return User.query.filter_by(
            provider=provider, 
            provider_id=provider_id
        ).first()

    def create(self, email: str, password_hash: str = None, 
               provider: str = "local", provider_id: str = None) -> User:
        """Create a new user."""
        user = User(
            email=email, 
            password_hash=password_hash,
            provider=provider,
            provider_id=provider_id
        )
        db.session.add(user)
        db.session.commit()
        return user

    def get_or_create_oauth_user(self, email: str, provider: str, 
                                  provider_id: str) -> User:
        """
        Get an existing OAuth user or create a new one.
        
        First checks if a user exists with the given provider and provider_id.
        If not, checks if a user exists with the same email.
        If neither exists, creates a new user.
        """
        # Check if user exists with this provider ID
        user = self.get_by_provider(provider, provider_id)
        if user:
            return user
        
        # Check if user exists with this email (might have registered locally or with another provider)
        user = self.get_by_email(email)
        if user:
            # Update the user's provider info if they're linking a new OAuth account
            # Note: In a real app, you might want more sophisticated account linking logic
            if user.provider == "local":
                user.provider = provider
                user.provider_id = provider_id
                db.session.commit()
            return user
        
        # Create new user
        return self.create(
            email=email,
            password_hash="OAUTH_USER_NO_PASSWORD",  # Placeholder for DBs with NOT NULL constraint
            provider=provider,
            provider_id=provider_id
        )

    def update_email(self, user_id: int, new_email: str) -> Optional[User]:
        """Update a user's email address."""
        user = self.get_by_id(user_id)
        if user:
            user.email = new_email
            db.session.commit()
        return user

    def update_password(self, user_id: int, new_password_hash: str) -> Optional[User]:
        """Update a user's password hash."""
        user = self.get_by_id(user_id)
        if user:
            user.password_hash = new_password_hash
            db.session.commit()
        return user

    def delete(self, user_id: int) -> bool:
        """Delete a user by ID."""
        user = self.get_by_id(user_id)
        if user:
            db.session.delete(user)
            db.session.commit()
        return True
