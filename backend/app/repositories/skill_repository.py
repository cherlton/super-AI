import json
from app.models.sql.skill_path import SkillPath
from app.extensions import db

class SkillRepository:

    def create(self, skill_name: str, steps: list, user_id: int):
        skill = SkillPath(
            skill_name=skill_name,
            steps=json.dumps(steps),
            user_id=user_id
        )
        db.session.add(skill)
        db.session.commit()
        return skill

    def get_by_user(self, user_id: int):
        return SkillPath.query.filter_by(user_id=user_id).all()

    def get_by_id(self, skill_id: int):
        return SkillPath.query.get(skill_id)

    def update(self):
        db.session.commit()
