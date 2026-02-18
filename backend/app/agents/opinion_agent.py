from app.services.youtube_service import YouTubeService
from app.services.llm_service import LLMService
from app.repositories.opinion_repository import OpinionRepository

class OpinionAgent:

    def __init__(self):
        self.youtube = YouTubeService()
        self.llm = LLMService()
        self.repo = OpinionRepository()

    def run(self, topic: str, user_id: int):
        videos = self.youtube.search_videos(topic)
        # Extract text content from video dictionaries for sentiment analysis
        content = [video.get('content_for_ai', '') for video in videos if video.get('content_for_ai')]
        sentiment = self.llm.analyze_opinions(content)

        summary = (
            f"Public opinion on '{topic}' is mostly positive "
            f"({sentiment['positive']}%)."
        )

        self.repo.create(
            topic=topic,
            summary=summary,
            sentiment=sentiment,
            user_id=user_id
        )

        return {
            "topic": topic,
            "summary": summary,
            "sentiment": sentiment
        }
