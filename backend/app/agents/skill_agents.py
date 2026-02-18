from app.services.youtube_service import YouTubeService
from app.services.embedding_service import EmbeddingService
from app.services.quiz_service import QuizService
from app.repositories.skill_repository import SkillRepository

class SkillAgent:

    def __init__(self):
        self.youtube = YouTubeService()
        self.embedder = EmbeddingService()
        self.quiz = QuizService()
        self.repo = SkillRepository()

    def run(self, skill: str, user_id: int):
        videos = self.youtube.search_videos(skill)
        # Extract text content for embeddings
        texts = [v.get('content_for_ai', '') for v in videos if v.get('content_for_ai')]
        embeddings = self.embedder.embed(texts)

        steps = []
        for video in videos[:3]:
            steps.append({
                "title": video['title'],
                "description": video['description'][:200],
                "quiz": self.quiz.generate_quiz(video['title'])
            })

        self.repo.create(
            skill_name=skill,
            steps=steps,
            user_id=user_id
        )

        return {
            "skill": skill,
            "steps": steps
        }
