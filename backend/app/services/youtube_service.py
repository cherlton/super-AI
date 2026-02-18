import os
from googleapiclient.discovery import build

class YouTubeService:
    def __init__(self):
        self.api_key = os.getenv("YOUTUBE_API_KEY")
        self.youtube = build('youtube', 'v3', developerKey=self.api_key)

    def search_videos(self, topic: str) -> list[dict]:
        request = self.youtube.search().list(
            q=topic,
            part='snippet',
            maxResults=10, # Reduced for speed in background checks
            type='video',
            order='relevance'
        )
        response = request.execute()
        
        video_ids = [item['id']['videoId'] for item in response.get('items', [])]
        stats = self.get_video_stats(video_ids) if video_ids else {}
        
        videos = []
        for item in response.get('items', []):
            vid = item['id']['videoId']
            v_stats = stats.get(vid, {})
            
            videos.append({
                "id": vid,
                "title": item['snippet']['title'],
                "description": item['snippet']['description'],
                "thumbnail": item['snippet']['thumbnails']['high']['url'],
                "url": f"https://www.youtube.com/watch?v={vid}",
                "published_at": item['snippet']['publishedAt'],
                "stats": v_stats,
                "content_for_ai": f"{item['snippet']['title']}: {item['snippet']['description']}"
            })
        return videos

    def get_video_stats(self, video_ids: list[str]) -> dict:
        """Fetch statistics for a list of video IDs."""
        if not video_ids:
            return {}
            
        request = self.youtube.videos().list(
            part='statistics,contentDetails',
            id=','.join(video_ids)
        )
        response = request.execute()
        
        stats = {}
        for item in response.get('items', []):
            stats[item['id']] = {
                "views": int(item['statistics'].get('viewCount', 0)),
                "likes": int(item['statistics'].get('likeCount', 0)),
                "comments": int(item['statistics'].get('commentCount', 0)),
                "duration": item['contentDetails'].get('duration')
            }
        return stats