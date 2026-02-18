import json
from app.models.sql.opinion_analysis import OpinionAnalysis
from app.extensions import db

class OpinionRepository:

    def create(self, topic: str, summary: str, sentiment: dict, user_id: int):
        opinion = OpinionAnalysis(
            topic=topic,
            summary=summary,
            sentiment_breakdown=json.dumps(sentiment),
            user_id=user_id
        )
        db.session.add(opinion)
        db.session.commit()
        return opinion

    def get_by_user(self, user_id: int):
        return OpinionAnalysis.query.filter_by(user_id=user_id).all()
