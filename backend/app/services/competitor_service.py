import os
import re
from datetime import datetime, timedelta
from googleapiclient.discovery import build
from app.extensions import db
from app.models.sql.competitor import Competitor, CompetitorVideo


class CompetitorService:
    """
    Service for managing competitor channel tracking and analysis.
    Fetches data from YouTube API and provides competitive insights.
    """
    
    def __init__(self):
        self.api_key = os.getenv("YOUTUBE_API_KEY")
        if self.api_key:
            self.youtube = build('youtube', 'v3', developerKey=self.api_key)
        else:
            self.youtube = None

    def extract_channel_id(self, url: str) -> dict:
        """
        Extract channel ID from various YouTube URL formats.
        Returns dict with channel_id and channel_type.
        """
        patterns = [
            # youtube.com/channel/UC...
            r'youtube\.com/channel/([a-zA-Z0-9_-]+)',
            # youtube.com/@username
            r'youtube\.com/@([a-zA-Z0-9_-]+)',
            # youtube.com/c/customname
            r'youtube\.com/c/([a-zA-Z0-9_-]+)',
            # youtube.com/user/username
            r'youtube\.com/user/([a-zA-Z0-9_-]+)',
        ]
        
        for i, pattern in enumerate(patterns):
            match = re.search(pattern, url)
            if match:
                identifier = match.group(1)
                if i == 0:  # Direct channel ID
                    return {"channel_id": identifier, "type": "id"}
                elif i == 1:  # Handle format
                    return {"channel_id": identifier, "type": "handle"}
                else:  # Custom URL or username
                    return {"channel_id": identifier, "type": "custom"}
        
        return None

    def get_channel_by_handle(self, handle: str) -> dict:
        """Get channel info by @handle."""
        if not self.youtube:
            return None
            
        try:
            request = self.youtube.search().list(
                q=handle,
                part='snippet',
                type='channel',
                maxResults=1
            )
            response = request.execute()
            
            if response.get('items'):
                return response['items'][0]
            return None
        except Exception as e:
            print(f"Error fetching channel by handle: {e}")
            return None

    def get_channel_details(self, channel_id: str) -> dict:
        """Fetch detailed channel information."""
        if not self.youtube:
            return None
            
        try:
            request = self.youtube.channels().list(
                part='snippet,statistics,contentDetails',
                id=channel_id
            )
            response = request.execute()
            
            if response.get('items'):
                item = response['items'][0]
                return {
                    "channel_id": item['id'],
                    "channel_name": item['snippet']['title'],
                    "description": item['snippet'].get('description', ''),
                    "thumbnail": item['snippet']['thumbnails'].get('high', {}).get('url'),
                    "subscriber_count": int(item['statistics'].get('subscriberCount', 0)),
                    "video_count": int(item['statistics'].get('videoCount', 0)),
                    "total_views": int(item['statistics'].get('viewCount', 0)),
                    "uploads_playlist": item['contentDetails']['relatedPlaylists'].get('uploads')
                }
            return None
        except Exception as e:
            print(f"Error fetching channel details: {e}")
            return None

    def add_competitor(self, user_id: int, channel_url: str) -> dict:
        """
        Add a new competitor channel for tracking.
        """
        # Extract channel identifier
        url_info = self.extract_channel_id(channel_url)
        if not url_info:
            return {"success": False, "error": "Invalid YouTube channel URL"}
        
        channel_id = url_info["channel_id"]
        
        # If it's a handle, search for the actual channel ID
        if url_info["type"] == "handle":
            channel_search = self.get_channel_by_handle(channel_id)
            if channel_search:
                channel_id = channel_search['snippet']['channelId']
            else:
                return {"success": False, "error": "Channel not found"}
        
        # Check if already tracking this competitor
        existing = Competitor.query.filter_by(
            user_id=user_id, 
            channel_id=channel_id
        ).first()
        
        if existing:
            return {"success": False, "error": "Already tracking this competitor"}
        
        # Fetch channel details
        channel_data = self.get_channel_details(channel_id)
        if not channel_data:
            return {"success": False, "error": "Could not fetch channel data"}
        
        # Create competitor record
        competitor = Competitor(
            user_id=user_id,
            channel_id=channel_data["channel_id"],
            channel_name=channel_data["channel_name"],
            channel_url=channel_url,
            channel_thumbnail=channel_data["thumbnail"],
            platform="youtube",
            subscriber_count=channel_data["subscriber_count"],
            video_count=channel_data["video_count"],
            total_views=channel_data["total_views"],
            last_synced_at=datetime.utcnow()
        )
        
        db.session.add(competitor)
        db.session.commit()
        
        # Fetch initial videos
        self.sync_competitor_videos(competitor.id, channel_data.get("uploads_playlist"))
        
        # Calculate metrics
        self.calculate_competitor_metrics(competitor.id)
        
        return {
            "success": True,
            "competitor": competitor.to_dict(include_videos=True)
        }

    def get_playlist_videos(self, playlist_id: str, max_results: int = 20) -> list:
        """Fetch videos from a playlist (typically uploads playlist)."""
        if not self.youtube:
            return []
            
        try:
            request = self.youtube.playlistItems().list(
                part='snippet,contentDetails',
                playlistId=playlist_id,
                maxResults=max_results
            )
            response = request.execute()
            
            video_ids = [item['contentDetails']['videoId'] for item in response.get('items', [])]
            
            if not video_ids:
                return []
            
            # Get video statistics
            stats_request = self.youtube.videos().list(
                part='statistics,contentDetails',
                id=','.join(video_ids)
            )
            stats_response = stats_request.execute()
            
            stats_map = {}
            for item in stats_response.get('items', []):
                stats_map[item['id']] = item
            
            videos = []
            for item in response.get('items', []):
                video_id = item['contentDetails']['videoId']
                stats = stats_map.get(video_id, {})
                
                videos.append({
                    "video_id": video_id,
                    "title": item['snippet']['title'],
                    "description": item['snippet'].get('description', ''),
                    "thumbnail_url": item['snippet']['thumbnails'].get('high', {}).get('url'),
                    "published_at": item['snippet'].get('publishedAt'),
                    "views": int(stats.get('statistics', {}).get('viewCount', 0)),
                    "likes": int(stats.get('statistics', {}).get('likeCount', 0)),
                    "comments": int(stats.get('statistics', {}).get('commentCount', 0)),
                    "duration": stats.get('contentDetails', {}).get('duration')
                })
            
            return videos
        except Exception as e:
            print(f"Error fetching playlist videos: {e}")
            return []

    def sync_competitor_videos(self, competitor_id: int, uploads_playlist: str = None) -> dict:
        """Sync/refresh videos for a competitor."""
        competitor = Competitor.query.get(competitor_id)
        if not competitor:
            return {"success": False, "error": "Competitor not found"}
        
        # If no playlist ID provided, fetch it
        if not uploads_playlist:
            channel_data = self.get_channel_details(competitor.channel_id)
            if channel_data:
                uploads_playlist = channel_data.get("uploads_playlist")
        
        if not uploads_playlist:
            return {"success": False, "error": "Could not find uploads playlist"}
        
        videos = self.get_playlist_videos(uploads_playlist)
        
        synced_count = 0
        for video_data in videos:
            # Check if video already exists
            existing = CompetitorVideo.query.filter_by(
                competitor_id=competitor_id,
                video_id=video_data["video_id"]
            ).first()
            
            if existing:
                # Update metrics
                existing.views = video_data["views"]
                existing.likes = video_data["likes"]
                existing.comments = video_data["comments"]
                existing.calculate_engagement_rate()
            else:
                # Create new video record
                video = CompetitorVideo(
                    competitor_id=competitor_id,
                    video_id=video_data["video_id"],
                    title=video_data["title"],
                    description=video_data["description"],
                    thumbnail_url=video_data["thumbnail_url"],
                    video_url=f"https://www.youtube.com/watch?v={video_data['video_id']}",
                    duration=video_data["duration"],
                    views=video_data["views"],
                    likes=video_data["likes"],
                    comments=video_data["comments"]
                )
                
                # Parse published date
                if video_data["published_at"]:
                    try:
                        video.published_at = datetime.fromisoformat(
                            video_data["published_at"].replace('Z', '+00:00')
                        )
                    except:
                        pass
                
                video.calculate_engagement_rate()
                db.session.add(video)
                synced_count += 1
        
        # Update competitor last synced
        competitor.last_synced_at = datetime.utcnow()
        db.session.commit()
        
        # Recalculate metrics
        self.calculate_competitor_metrics(competitor_id)
        
        return {
            "success": True,
            "synced_videos": synced_count,
            "total_videos": len(videos)
        }

    def calculate_competitor_metrics(self, competitor_id: int):
        """Calculate aggregate metrics for a competitor."""
        competitor = Competitor.query.get(competitor_id)
        if not competitor:
            return
        
        videos = CompetitorVideo.query.filter_by(competitor_id=competitor_id).all()
        
        if videos:
            # Calculate average views
            total_views = sum(v.views for v in videos)
            competitor.average_views = total_views // len(videos)
            
            # Calculate upload frequency
            dated_videos = [v for v in videos if v.published_at]
            if len(dated_videos) >= 2:
                dated_videos.sort(key=lambda x: x.published_at, reverse=True)
                
                # Calculate average days between uploads
                date_diffs = []
                for i in range(len(dated_videos) - 1):
                    diff = (dated_videos[i].published_at - dated_videos[i + 1].published_at).days
                    date_diffs.append(diff)
                
                if date_diffs:
                    avg_days = sum(date_diffs) / len(date_diffs)
                    if avg_days <= 1:
                        competitor.upload_frequency = "Daily"
                    elif avg_days <= 3:
                        competitor.upload_frequency = f"{int(7 // avg_days)} videos/week"
                    elif avg_days <= 7:
                        competitor.upload_frequency = "Weekly"
                    elif avg_days <= 14:
                        competitor.upload_frequency = "Bi-weekly"
                    else:
                        competitor.upload_frequency = f"Every {int(avg_days)} days"
            
            # Calculate viral scores
            if total_views > 0:
                max_views = max(v.views for v in videos)
                for video in videos:
                    # Viral score based on relative performance
                    video.viral_score = int((video.views / max_views) * 100)
        
        db.session.commit()

    def get_competitor_list(self, user_id: int) -> list:
        """Get all competitors for a user."""
        competitors = Competitor.query.filter_by(
            user_id=user_id, 
            is_active=True
        ).order_by(Competitor.created_at.desc()).all()
        
        return [c.to_dict() for c in competitors]

    def get_competitor_details(self, competitor_id: int, user_id: int) -> dict:
        """Get competitor details with videos."""
        competitor = Competitor.query.filter_by(
            id=competitor_id, 
            user_id=user_id
        ).first()
        
        if not competitor:
            return None
        
        return competitor.to_dict(include_videos=True)

    def get_viral_videos(self, competitor_id: int, user_id: int, min_score: int = 70) -> list:
        """Get viral videos (high performing) from a competitor."""
        competitor = Competitor.query.filter_by(
            id=competitor_id, 
            user_id=user_id
        ).first()
        
        if not competitor:
            return []
        
        videos = CompetitorVideo.query.filter(
            CompetitorVideo.competitor_id == competitor_id,
            CompetitorVideo.viral_score >= min_score
        ).order_by(CompetitorVideo.viral_score.desc()).limit(10).all()
        
        return [v.to_dict() for v in videos]

    def get_content_gaps(self, user_id: int) -> dict:
        """
        Analyze content gaps between user and competitors.
        Returns topics competitors cover that user might be missing.
        """
        # Get all competitor videos
        competitors = Competitor.query.filter_by(user_id=user_id, is_active=True).all()
        
        all_competitor_topics = []
        for comp in competitors:
            videos = CompetitorVideo.query.filter_by(
                competitor_id=comp.id
            ).order_by(CompetitorVideo.views.desc()).limit(20).all()
            
            for video in videos:
                all_competitor_topics.append({
                    "title": video.title,
                    "views": video.views,
                    "engagement": video.engagement_rate,
                    "competitor": comp.channel_name
                })
        
        return {
            "competitor_count": len(competitors),
            "topics_analyzed": len(all_competitor_topics),
            "top_competitor_content": sorted(
                all_competitor_topics, 
                key=lambda x: x["views"], 
                reverse=True
            )[:20]
        }

    def delete_competitor(self, competitor_id: int, user_id: int) -> dict:
        """Delete a competitor from tracking."""
        competitor = Competitor.query.filter_by(
            id=competitor_id, 
            user_id=user_id
        ).first()
        
        if not competitor:
            return {"success": False, "error": "Competitor not found"}
        
        db.session.delete(competitor)
        db.session.commit()
        
        return {"success": True, "message": "Competitor removed successfully"}
