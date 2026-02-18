from app.services.youtube_service import YouTubeService
from app.services.embedding_service import EmbeddingService
from app.services.clustering_service import ClusteringService
from app.repositories.trend_repository import TrendRepository
from app.services.llm_service import LLMService # Add this import

class TrendAgent:
    def __init__(self):
        self.youtube = YouTubeService()
        self.embedder = EmbeddingService()
        self.clusterer = ClusteringService()
        self.llm = LLMService() # Add this
        self.repo = TrendRepository()
    def run(self, topic: str, user_id: int):
        videos_data = self.youtube.search_videos(topic)
        ai_input_texts = [v['content_for_ai'] for v in videos_data]
        
        # Calculate Virality Score
        virality_score = self._calculate_virality(videos_data)
        
        # Get AI Deep Summary
        dynamic_summary = self.llm.summarize_trends(topic, ai_input_texts)
        
        # Get Clusters
        embeddings = self.embedder.embed(ai_input_texts)
        clusters = self.clusterer.cluster(embeddings)
        
        # Save to DB
        self.repo.create(topic=topic, summary=dynamic_summary, user_id=user_id)
        
        return {
            "topic": topic,
            "summary": dynamic_summary,
            "clusters": clusters,
            "virality_score": virality_score,
            "video_count": len(videos_data),
            "videos": [
                {
                    "id": v['id'],
                    "title": v['title'],
                    "url": v['url'],
                    "thumbnail": v['thumbnail'],
                    "stats": v.get('stats', {})
                } for v in videos_data
            ]
        }

    def _calculate_virality(self, videos_data: list[dict]) -> int:
        """
        Calculate a normalized virality score (0-100).
        Considers Engagement (likes/comments per view) and Velocity (views per hour).
        """
        if not videos_data:
            return 0
            
        total_score = 0
        from datetime import datetime, timezone
        import dateutil.parser
        
        now = datetime.now(timezone.utc)
        
        for v in videos_data:
            stats = v.get('stats', {})
            views = stats.get('views', 0)
            likes = stats.get('likes', 0)
            comments = stats.get('comments', 0)
            
            if views == 0: continue
            
            # Engagement Factor (max ~20 points)
            engagement_rate = (likes + comments * 2) / views
            eng_score = min(20, engagement_rate * 200) # 10% engagement = 20 points
            
            # Velocity Factor (max ~80 points)
            published_at = dateutil.parser.isoparse(v['published_at'])
            hours_since = max(1, (now - published_at).total_seconds() / 3600)
            vph = views / hours_since # Views per hour
            
            # Logarithmic scaling for views per hour
            import math
            vel_score = min(80, math.log1p(vph) * 8) # 22k VPH ~ 80 points
            
            total_score += (eng_score + vel_score)
            
        avg_score = total_score / len(videos_data)
        return int(min(100, avg_score))