from app.models.sql.trend_analysis import TrendAnalysis
from app.extensions import db

class TrendRepository:

    def create(self, topic: str, summary: str, user_id: int):
        trend = TrendAnalysis(
            topic=topic,
            summary=summary,
            user_id=user_id
        )
        db.session.add(trend)
        db.session.commit()
        return trend

    def get_by_user(self, user_id: int):
        return TrendAnalysis.query.filter_by(user_id=user_id).all()
