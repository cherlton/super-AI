from pydantic import BaseModel
from typing import List

class SkillRequest(BaseModel):
    skill: str

class SkillStep(BaseModel):
    title: str
    description: str

class SkillResponse(BaseModel):
    skill: str
    steps: List[SkillStep]
