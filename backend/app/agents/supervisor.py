from app.agents.trend_agents import TrendAgent
from app.agents.skill_agents import SkillAgent
from app.agents.opinion_agent import OpinionAgent

class SupervisorAgent:

    def __init__(self):
        self.trend_agent = TrendAgent()
        self.skill_agent = SkillAgent()
        self.opinion_agent = OpinionAgent()

    def handle_trend_request(self, topic: str, user_id: int):
        return self.trend_agent.run(topic, user_id)

    def handle_skill_request(self, skill: str, user_id: int):
        return self.skill_agent.run(skill, user_id)

    def handle_opinion_request(self, topic: str, user_id: int):
        return self.opinion_agent.run(topic, user_id)
