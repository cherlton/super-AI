from datetime import datetime, timedelta
from app.extensions import db
from app.models.sql.creator_profile import CreatorProfile, CollabRequest
from sqlalchemy import or_, and_


class CollaborationService:
    """
    Service for creator collaboration matching and request management.
    """

    # Weights for match score calculation
    NICHE_WEIGHT = 30
    AUDIENCE_WEIGHT = 25
    STYLE_WEIGHT = 20
    PLATFORM_WEIGHT = 15
    ACTIVITY_WEIGHT = 10

    def calculate_match_score(self, profile_a: CreatorProfile, profile_b: CreatorProfile) -> dict:
        """
        Calculate compatibility score between two creators.
        
        Returns:
            Dict with total score and breakdown
        """
        scores = {
            "niche_score": 0,
            "audience_score": 0,
            "style_score": 0,
            "platform_score": 0,
            "activity_score": 0
        }
        
        # 1. Niche Match (30%)
        niche_score = 0
        if profile_a.niche.lower() == profile_b.niche.lower():
            niche_score = 100
        else:
            # Check sub-niches overlap
            a_niches = set([profile_a.niche.lower()] + [n.lower() for n in profile_a.get_sub_niches()])
            b_niches = set([profile_b.niche.lower()] + [n.lower() for n in profile_b.get_sub_niches()])
            overlap = len(a_niches.intersection(b_niches))
            if overlap > 0:
                niche_score = min(overlap * 40, 80)
        scores["niche_score"] = niche_score
        
        # 2. Audience Compatibility (25%)
        # Best match is similar audience size (within 2x range)
        audience_score = 0
        if profile_a.audience_size > 0 and profile_b.audience_size > 0:
            ratio = min(profile_a.audience_size, profile_b.audience_size) / max(profile_a.audience_size, profile_b.audience_size)
            if ratio >= 0.5:  # Within 2x
                audience_score = 100
            elif ratio >= 0.2:  # Within 5x
                audience_score = 70
            elif ratio >= 0.1:  # Within 10x
                audience_score = 40
            else:
                audience_score = 20
            
            # Check if fits preferred audience range
            if profile_b.preferred_min_audience and profile_a.audience_size < profile_b.preferred_min_audience:
                audience_score = max(0, audience_score - 30)
            if profile_b.preferred_max_audience and profile_a.audience_size > profile_b.preferred_max_audience:
                audience_score = max(0, audience_score - 20)
        scores["audience_score"] = audience_score
        
        # 3. Content Style Match (20%)
        style_score = 0
        if profile_a.content_style and profile_b.content_style:
            if profile_a.content_style.lower() == profile_b.content_style.lower():
                style_score = 100
            else:
                # Compatible styles
                compatible_styles = {
                    "educational": ["tutorials", "explainers", "howto"],
                    "entertainment": ["comedy", "vlogs", "challenges"],
                    "reviews": ["tutorials", "howto", "educational"]
                }
                a_style = profile_a.content_style.lower()
                b_style = profile_b.content_style.lower()
                if a_style in compatible_styles and b_style in compatible_styles.get(a_style, []):
                    style_score = 70
                else:
                    style_score = 30  # Different styles can still work
        else:
            style_score = 50  # Unknown style
        scores["style_score"] = style_score
        
        # 4. Platform Overlap (15%)
        platform_score = 0
        a_platforms = set(profile_a.get_platforms().keys())
        b_platforms = set(profile_b.get_platforms().keys())
        if a_platforms and b_platforms:
            overlap = len(a_platforms.intersection(b_platforms))
            total = len(a_platforms.union(b_platforms))
            platform_score = (overlap / total) * 100 if total > 0 else 0
        scores["platform_score"] = platform_score
        
        # 5. Activity Score (10%)
        # Based on how recently profile was updated
        activity_score = 100
        if profile_b.updated_at:
            days_since_update = (datetime.utcnow() - profile_b.updated_at).days
            if days_since_update > 90:
                activity_score = 30
            elif days_since_update > 30:
                activity_score = 60
            elif days_since_update > 7:
                activity_score = 80
        scores["activity_score"] = activity_score
        
        # Calculate weighted total
        total_score = (
            (scores["niche_score"] * self.NICHE_WEIGHT / 100) +
            (scores["audience_score"] * self.AUDIENCE_WEIGHT / 100) +
            (scores["style_score"] * self.STYLE_WEIGHT / 100) +
            (scores["platform_score"] * self.PLATFORM_WEIGHT / 100) +
            (scores["activity_score"] * self.ACTIVITY_WEIGHT / 100)
        )
        
        return {
            "total_score": round(total_score, 1),
            "breakdown": scores,
            "compatibility_level": self._get_compatibility_level(total_score)
        }

    def _get_compatibility_level(self, score: float) -> str:
        """Get human-readable compatibility level."""
        if score >= 80:
            return "Excellent Match"
        elif score >= 60:
            return "Good Match"
        elif score >= 40:
            return "Moderate Match"
        else:
            return "Low Match"

    def find_matches(self, user_id: int, filters: dict = None) -> list:
        """
        Find potential collaboration partners for a user.
        
        Args:
            user_id: The user's ID
            filters: Optional filters (niche, min_audience, max_audience, style)
        
        Returns:
            List of matches with scores
        """
        filters = filters or {}
        
        # Get user's profile
        user_profile = CreatorProfile.query.filter_by(user_id=user_id).first()
        if not user_profile:
            return []
        
        # Build query for potential matches
        query = CreatorProfile.query.filter(
            CreatorProfile.user_id != user_id,
            CreatorProfile.is_open_to_collabs == True
        )
        
        # Apply filters
        if filters.get("niche"):
            query = query.filter(CreatorProfile.niche.ilike(f"%{filters['niche']}%"))
        
        if filters.get("min_audience"):
            query = query.filter(CreatorProfile.audience_size >= filters["min_audience"])
        
        if filters.get("max_audience"):
            query = query.filter(CreatorProfile.audience_size <= filters["max_audience"])
        
        if filters.get("style"):
            query = query.filter(CreatorProfile.content_style.ilike(f"%{filters['style']}%"))
        
        # Get all potential matches
        potential_matches = query.all()
        
        # Calculate match scores
        matches = []
        for profile in potential_matches:
            score_data = self.calculate_match_score(user_profile, profile)
            matches.append({
                "profile": profile.to_dict(),
                "match_score": score_data["total_score"],
                "score_breakdown": score_data["breakdown"],
                "compatibility_level": score_data["compatibility_level"]
            })
        
        # Sort by match score descending
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        
        return matches

    def get_or_create_profile(self, user_id: int, data: dict) -> dict:
        """
        Get or create a creator profile.
        """
        profile = CreatorProfile.query.filter_by(user_id=user_id).first()
        
        if profile:
            # Update existing profile
            if data.get("display_name"):
                profile.display_name = data["display_name"]
            if "bio" in data:
                profile.bio = data.get("bio")
            if "profile_image_url" in data:
                profile.profile_image_url = data.get("profile_image_url")
            if data.get("niche"):
                profile.niche = data["niche"]
            if "sub_niches" in data:
                profile.set_sub_niches(data.get("sub_niches", []))
            if "content_style" in data:
                profile.content_style = data.get("content_style")
            if "platforms" in data:
                profile.set_platforms(data.get("platforms", {}))
            if "is_open_to_collabs" in data:
                profile.is_open_to_collabs = data.get("is_open_to_collabs", True)
            if "collab_interests" in data:
                profile.set_collab_interests(data.get("collab_interests", []))
            if "preferred_min_audience" in data:
                profile.preferred_min_audience = data.get("preferred_min_audience", 0)
            if "preferred_max_audience" in data:
                profile.preferred_max_audience = data.get("preferred_max_audience")
            
            profile.updated_at = datetime.utcnow()
        else:
            # Create new profile
            profile = CreatorProfile(
                user_id=user_id,
                display_name=data.get("display_name", f"Creator {user_id}"),
                bio=data.get("bio"),
                profile_image_url=data.get("profile_image_url"),
                niche=data.get("niche", "General"),
                content_style=data.get("content_style"),
                is_open_to_collabs=data.get("is_open_to_collabs", True),
                preferred_min_audience=data.get("preferred_min_audience", 0),
                preferred_max_audience=data.get("preferred_max_audience")
            )
            
            if data.get("sub_niches"):
                profile.set_sub_niches(data["sub_niches"])
            if data.get("platforms"):
                profile.set_platforms(data["platforms"])
            if data.get("collab_interests"):
                profile.set_collab_interests(data["collab_interests"])
            
            db.session.add(profile)
        
        db.session.commit()
        
        return {
            "success": True,
            "profile": profile.to_dict()
        }

    def send_collab_request(self, sender_user_id: int, receiver_profile_id: int, data: dict) -> dict:
        """
        Send a collaboration request to another creator.
        """
        # Get sender's profile
        sender_profile = CreatorProfile.query.filter_by(user_id=sender_user_id).first()
        if not sender_profile:
            return {"success": False, "error": "You need to create a creator profile first"}
        
        # Get receiver's profile
        receiver_profile = CreatorProfile.query.get(receiver_profile_id)
        if not receiver_profile:
            return {"success": False, "error": "Creator not found"}
        
        if receiver_profile.user_id == sender_user_id:
            return {"success": False, "error": "You cannot send a request to yourself"}
        
        if not receiver_profile.is_open_to_collabs:
            return {"success": False, "error": "This creator is not open to collaborations"}
        
        # Check for existing pending request
        existing = CollabRequest.query.filter(
            CollabRequest.sender_id == sender_profile.id,
            CollabRequest.receiver_id == receiver_profile.id,
            CollabRequest.status == "pending"
        ).first()
        
        if existing:
            return {"success": False, "error": "You already have a pending request to this creator"}
        
        # Calculate match score
        score_data = self.calculate_match_score(sender_profile, receiver_profile)
        
        # Create request
        request = CollabRequest(
            sender_id=sender_profile.id,
            receiver_id=receiver_profile.id,
            collab_type=data.get("collab_type"),
            message=data.get("message"),
            ai_generated_pitch=data.get("ai_generated_pitch", False),
            match_score=score_data["total_score"],
            expires_at=datetime.utcnow() + timedelta(days=14)  # 2 week expiry
        )
        
        db.session.add(request)
        db.session.commit()
        
        return {
            "success": True,
            "request": request.to_dict(include_profiles=True)
        }

    def respond_to_request(self, request_id: int, user_id: int, accept: bool, message: str = None) -> dict:
        """
        Accept or decline a collaboration request.
        """
        # Get user's profile
        profile = CreatorProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            return {"success": False, "error": "Profile not found"}
        
        # Get the request
        request = CollabRequest.query.filter_by(id=request_id, receiver_id=profile.id).first()
        if not request:
            return {"success": False, "error": "Request not found"}
        
        if request.status != "pending":
            return {"success": False, "error": f"Request already {request.status}"}
        
        if request.is_expired():
            request.status = "expired"
            db.session.commit()
            return {"success": False, "error": "Request has expired"}
        
        if accept:
            request.accept(message)
        else:
            request.decline(message)
        
        db.session.commit()
        
        return {
            "success": True,
            "request": request.to_dict(include_profiles=True)
        }

    def get_pending_requests(self, user_id: int, direction: str = "both") -> dict:
        """
        Get pending collaboration requests.
        
        Args:
            user_id: User's ID
            direction: "incoming", "outgoing", or "both"
        """
        profile = CreatorProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            return {"incoming": [], "outgoing": []}
        
        result = {"incoming": [], "outgoing": []}
        
        if direction in ["incoming", "both"]:
            incoming = CollabRequest.query.filter_by(
                receiver_id=profile.id,
                status="pending"
            ).order_by(CollabRequest.created_at.desc()).all()
            result["incoming"] = [r.to_dict(include_profiles=True) for r in incoming]
        
        if direction in ["outgoing", "both"]:
            outgoing = CollabRequest.query.filter_by(
                sender_id=profile.id,
                status="pending"
            ).order_by(CollabRequest.created_at.desc()).all()
            result["outgoing"] = [r.to_dict(include_profiles=True) for r in outgoing]
        
        return result

    def get_collab_history(self, user_id: int, limit: int = 20) -> list:
        """
        Get past collaboration requests (accepted/declined).
        """
        profile = CreatorProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            return []
        
        requests = CollabRequest.query.filter(
            or_(
                CollabRequest.sender_id == profile.id,
                CollabRequest.receiver_id == profile.id
            ),
            CollabRequest.status.in_(["accepted", "declined"])
        ).order_by(CollabRequest.responded_at.desc()).limit(limit).all()
        
        return [r.to_dict(include_profiles=True) for r in requests]

    def get_profile_by_id(self, profile_id: int) -> dict:
        """Get a creator profile by ID."""
        profile = CreatorProfile.query.get(profile_id)
        if not profile:
            return None
        return profile.to_dict()

    def get_profile_by_user(self, user_id: int) -> dict:
        """Get a creator profile by user ID."""
        profile = CreatorProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            return None
        return profile.to_dict()
