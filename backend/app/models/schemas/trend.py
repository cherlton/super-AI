from pydantic import BaseModel
from typing import List

class TrendRequest(BaseModel):
    topic: str

class TrendResponse(BaseModel):
    topic: str
    summary: str
