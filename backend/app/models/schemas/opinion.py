from pydantic import BaseModel
from typing import Dict

class OpinionRequest(BaseModel):
    topic: str

class OpinionResponse(BaseModel):
    topic: str
    summary: str
    sentiment: Dict[str, int]
