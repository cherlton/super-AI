import os
import json
from groq import Groq


class GroqLLMService:
    """
    LLaMA 3 powered content generation service using Groq's free API tier.
    Generates video scripts, social media posts, captions, hashtags, and more.
    """
    
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.1-8b-instant"  # Fast, free tier model
    
    def _generate(self, prompt: str, max_tokens: int = 2048, json_mode: bool = False) -> str:
        """Base generation method with error handling."""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert content creator and social media strategist. Create engaging, viral-worthy content that captures attention and drives engagement."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=max_tokens,
                temperature=0.8,
                response_format={"type": "json_object"} if json_mode else None
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Groq LLM Error: {e}")
            raise Exception(f"Content generation failed: {str(e)}")
    
    def generate_hook(self, topic: str, platform: str = "tiktok", style: str = "engaging") -> dict:
        """
        Generate attention-grabbing hooks for the first 3 seconds of a video.
        
        Args:
            topic: The main topic/niche for the content
            platform: Target platform (tiktok, instagram, youtube)
            style: Content style (engaging, educational, controversial, storytelling)
        
        Returns:
            dict with multiple hook variations
        """
        prompt = f"""Generate 5 powerful video hooks for the first 3 seconds about "{topic}".

Target platform: {platform}
Style: {style}

Each hook should:
- Immediately grab attention
- Create curiosity or urgency
- Be under 15 words
- Work well with on-screen text

Return a JSON object with this exact structure:
{{
    "hooks": [
        {{
            "text": "The actual hook text",
            "type": "question/statement/statistic/challenge/story",
            "emotion": "curiosity/shock/fear/excitement/controversy",
            "estimated_retention_boost": "percentage like 85%"
        }}
    ],
    "best_for_platform": "Which hook works best for {platform} and why"
}}"""
        
        result = self._generate(prompt, json_mode=True)
        return json.loads(result)
    
    def generate_full_script(self, topic: str, duration: int = 60, platform: str = "tiktok", style: str = "engaging") -> dict:
        """
        Generate a complete video script with timing cues.
        
        Args:
            topic: The main topic/niche
            duration: Target video duration in seconds (30, 60, 90, 180)
            platform: Target platform
            style: Content style
        
        Returns:
            dict with structured script including timing cues
        """
        prompt = f"""Create a complete {duration}-second video script about "{topic}".

Platform: {platform}
Style: {style}

Include:
1. Hook (0-3 seconds) - Attention grabber
2. Problem/Pain Point (3-15 seconds) - Relate to audience
3. Solution/Value (15-{duration-15} seconds) - Main content
4. Call to Action ({duration-15}-{duration} seconds) - What to do next

Return a JSON object with this structure:
{{
    "title": "Compelling video title",
    "total_duration": {duration},
    "segments": [
        {{
            "name": "Hook",
            "start_time": 0,
            "end_time": 3,
            "script": "Exact words to say",
            "visual_cues": "What should be on screen",
            "delivery_notes": "How to deliver (energy, pace, emotion)"
        }}
    ],
    "b_roll_suggestions": ["list of b-roll ideas"],
    "music_mood": "Suggested music mood/tempo",
    "text_overlays": ["Key text to show on screen"]
}}"""
        
        result = self._generate(prompt, max_tokens=3000, json_mode=True)
        return json.loads(result)
    
    def generate_captions(self, topic: str, content_summary: str = "", tone: str = "engaging") -> dict:
        """
        Generate 5 caption variations for each major platform.
        
        Args:
            topic: The main topic
            content_summary: Brief summary of the video content
            tone: Caption tone (engaging, professional, casual, humorous)
        
        Returns:
            dict with platform-specific captions
        """
        prompt = f"""Create social media captions for content about "{topic}".

Content summary: {content_summary if content_summary else topic}
Tone: {tone}

Generate 5 unique captions for EACH platform, optimized for their specific algorithm and audience:

Return a JSON object with this structure:
{{
    "tiktok": {{
        "captions": [
            {{
                "text": "Caption with emojis and hooks",
                "character_count": 150,
                "includes_cta": true
            }}
        ],
        "best_posting_tip": "Platform-specific tip"
    }},
    "instagram": {{
        "captions": [
            {{
                "text": "Caption optimized for IG",
                "character_count": 200,
                "includes_cta": true
            }}
        ],
        "best_posting_tip": "Platform-specific tip"
    }},
    "youtube": {{
        "captions": [
            {{
                "text": "Description/community post text",
                "character_count": 300,
                "includes_cta": true
            }}
        ],
        "best_posting_tip": "Platform-specific tip"
    }}
}}"""
        
        result = self._generate(prompt, max_tokens=3000, json_mode=True)
        return json.loads(result)
    
    def generate_hashtags(self, topic: str, platform: str = "all", niche: str = "") -> dict:
        """
        Generate optimized hashtag suggestions for maximum reach.
        
        Args:
            topic: The main topic
            platform: Target platform or "all"
            niche: Specific niche/industry
        
        Returns:
            dict with categorized hashtag suggestions
        """
        prompt = f"""Generate optimized hashtags for content about "{topic}".

Platform: {platform}
Niche: {niche if niche else "general"}

Create hashtags in these categories:
1. High volume (1M+ posts) - for discovery
2. Medium volume (100K-1M) - for competition balance
3. Niche specific (under 100K) - for targeted reach
4. Trending/timely - current trends
5. Branded potential - unique memorable tags

Return a JSON object with this structure:
{{
    "hashtag_strategy": {{
        "total_recommended": 30,
        "optimal_count_per_platform": {{
            "tiktok": 5,
            "instagram": 25,
            "youtube": 10
        }}
    }},
    "categories": {{
        "high_volume": ["#hashtag1", "#hashtag2"],
        "medium_volume": ["#hashtag1", "#hashtag2"],
        "niche_specific": ["#hashtag1", "#hashtag2"],
        "trending": ["#hashtag1", "#hashtag2"],
        "branded_potential": ["#hashtag1", "#hashtag2"]
    }},
    "recommended_combinations": {{
        "tiktok": ["#tag1", "#tag2", "#tag3"],
        "instagram": ["#tag1", "#tag2", "#tag3"],
        "youtube": ["#tag1", "#tag2", "#tag3"]
    }},
    "avoid_hashtags": ["Lists generic or overused tags to avoid"]
}}"""
        
        result = self._generate(prompt, json_mode=True)
        return json.loads(result)
    
    def generate_thumbnail_titles(self, topic: str, video_type: str = "educational", target_emotion: str = "curiosity") -> dict:
        """
        Generate compelling thumbnail title ideas.
        
        Args:
            topic: The main topic
            video_type: Type of video content
            target_emotion: Emotion to trigger (curiosity, shock, fomo, excitement)
        
        Returns:
            dict with thumbnail title suggestions
        """
        prompt = f"""Generate 10 attention-grabbing thumbnail titles for a video about "{topic}".

Video type: {video_type}
Target emotion: {target_emotion}

Each title should:
- Be under 50 characters (visible on thumbnails)
- Use power words that trigger clicks
- Create curiosity gap or urgency
- Work with visual elements

Return a JSON object with this structure:
{{
    "titles": [
        {{
            "text": "THE THUMBNAIL TITLE",
            "character_count": 25,
            "power_words_used": ["word1", "word2"],
            "emotion_triggered": "curiosity",
            "suggested_visual": "What image/face expression to pair with"
        }}
    ],
    "thumbnail_tips": [
        "General tips for creating effective thumbnails"
    ],
    "color_suggestions": {{
        "primary": "#color",
        "accent": "#color",
        "text": "#color"
    }}
}}"""
        
        result = self._generate(prompt, json_mode=True)
        return json.loads(result)
    
    def generate_complete_content(self, topic: str, platform: str = "all", duration: int = 60, 
                                   style: str = "engaging", niche: str = "") -> dict:
        """
        Generate a complete content package with all elements.
        
        This is the main method that orchestrates all generators to create
        a comprehensive content package for creators.
        
        Args:
            topic: The main topic/trending subject
            platform: Target platform(s)
            duration: Video duration in seconds
            style: Content style
            niche: Specific niche/industry
        
        Returns:
            Complete content package with hooks, script, captions, hashtags, and thumbnails
        """
        try:
            # Generate all components
            hooks = self.generate_hook(topic, platform, style)
            script = self.generate_full_script(topic, duration, platform, style)
            captions = self.generate_captions(topic, script.get("title", topic), style)
            hashtags = self.generate_hashtags(topic, platform, niche)
            thumbnails = self.generate_thumbnail_titles(topic)
            
            return {
                "success": True,
                "topic": topic,
                "platform": platform,
                "content_package": {
                    "hooks": hooks,
                    "script": script,
                    "captions": captions,
                    "hashtags": hashtags,
                    "thumbnails": thumbnails
                },
                "estimated_time_saved": "4-6 hours",
                "content_ready": True
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "topic": topic
            }
    
    def test_connection(self) -> dict:
        """Test the Groq API connection."""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": "Say 'API connected successfully' in 5 words or less."}],
                max_tokens=20
            )
            return {
                "success": True,
                "message": response.choices[0].message.content,
                "model": self.model
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    # ============ COMPETITOR ANALYSIS METHODS ============
    
    def analyze_viral_video(self, video_data: dict) -> dict:
        """
        Analyze why a competitor's video went viral.
        
        Args:
            video_data: Dict with title, description, views, likes, comments, engagement_rate
        
        Returns:
            AI analysis of viral factors
        """
        prompt = f"""Analyze why this video went viral and extract actionable insights.

Video Data:
- Title: {video_data.get('title', 'Unknown')}
- Description: {video_data.get('description', 'No description')[:500]}
- Views: {video_data.get('views', 0):,}
- Likes: {video_data.get('likes', 0):,}
- Comments: {video_data.get('comments', 0):,}
- Engagement Rate: {video_data.get('engagement_rate', 0):.2f}%

Return a JSON object with this structure:
{{
    "viral_factors": [
        {{
            "factor": "Factor name (e.g., 'Curiosity Gap', 'Trending Topic')",
            "explanation": "Why this contributed to virality",
            "replicability": "Easy/Medium/Hard to replicate"
        }}
    ],
    "hook_analysis": {{
        "strength": "Strong/Medium/Weak",
        "what_worked": "Specific element that grabbed attention"
    }},
    "content_structure": {{
        "pacing": "Fast/Medium/Slow",
        "storytelling": "Description of narrative structure"
    }},
    "audience_psychology": "Why viewers engaged with this content",
    "actionable_takeaways": [
        "Specific thing you can do to replicate this success"
    ],
    "content_ideas": [
        "Similar content idea you could create"
    ]
}}"""
        
        result = self._generate(prompt, max_tokens=2000, json_mode=True)
        return json.loads(result)

    def analyze_content_gaps(self, user_topics: list, competitor_topics: list) -> dict:
        """
        Identify content opportunities based on competitor coverage gaps.
        
        Args:
            user_topics: List of topics the user has covered
            competitor_topics: List of competitor video titles/topics
        
        Returns:
            Gap analysis with opportunities
        """
        prompt = f"""Analyze content gaps between a creator and their competitors.

Creator's Topics (what they've already covered):
{json.dumps(user_topics[:20], indent=2)}

Competitor Topics (what competitors are covering successfully):
{json.dumps(competitor_topics[:30], indent=2)}

Identify opportunities where competitors are succeeding but the creator hasn't covered yet.

Return a JSON object with this structure:
{{
    "gap_analysis": {{
        "topics_missing": [
            {{
                "topic": "Topic/theme the creator is missing",
                "competitor_success": "Evidence of competitor success",
                "priority": "High/Medium/Low",
                "difficulty": "Easy/Medium/Hard"
            }}
        ],
        "trending_gaps": [
            "Trending topics competitors are capitalizing on"
        ],
        "format_gaps": [
            "Content formats competitors use that creator doesn't"
        ]
    }},
    "recommended_actions": [
        {{
            "action": "Specific action to take",
            "expected_impact": "High/Medium/Low",
            "implementation_tip": "How to execute this"
        }}
    ],
    "content_calendar_suggestions": [
        {{
            "week": 1,
            "topic": "Suggested topic",
            "reasoning": "Why this week"
        }}
    ],
    "quick_wins": [
        "Easy content ideas to implement immediately"
    ]
}}"""
        
        result = self._generate(prompt, max_tokens=2500, json_mode=True)
        return json.loads(result)

    # ============ NICHE FINDER METHODS ============
    
    def analyze_niche(self, niche_name: str) -> dict:
        """
        Analyze a niche for demand, competition, and opportunity.
        
        Args:
            niche_name: The niche to analyze
        
        Returns:
            Comprehensive niche analysis
        """
        prompt = f"""Analyze the content creator niche: "{niche_name}"

Evaluate this niche for YouTube/TikTok content creation potential.

Return a JSON object with this structure:
{{
    "niche_name": "{niche_name}",
    "description": "Brief description of this niche",
    "scores": {{
        "demand_score": 75,
        "competition_score": 60,
        "opportunity_score": 70,
        "growth_potential": 80
    }},
    "audience": {{
        "size_estimate": "500K - 2M",
        "demographics": "Primary audience description",
        "pain_points": ["What problems does this audience have"],
        "content_preferences": ["What type of content they consume"]
    }},
    "monetization": {{
        "estimated_monthly_earnings": "$1,000 - $5,000",
        "revenue_streams": ["Ads", "Sponsorships", "Products"],
        "avg_cpm": "$4-8",
        "affiliate_potential": "High/Medium/Low"
    }},
    "content_strategy": {{
        "best_formats": ["Tutorials", "Reviews", "Vlogs"],
        "posting_frequency": "3-4 videos/week",
        "best_platforms": ["YouTube", "TikTok"],
        "content_pillars": ["Main content themes"]
    }},
    "growth_trend": "rising",
    "barriers_to_entry": ["What makes this niche hard to enter"],
    "success_factors": ["What it takes to succeed"],
    "example_channels": [
        {{
            "name": "Example Channel Name",
            "subscribers": "500K",
            "what_they_do_well": "Their strength"
        }}
    ],
    "verdict": "Overall recommendation for this niche"
}}"""
        
        result = self._generate(prompt, max_tokens=2500, json_mode=True)
        return json.loads(result)

    def find_micro_niches(self, parent_niche: str) -> dict:
        """
        Find micro-niche opportunities within a broader niche.
        
        Args:
            parent_niche: The broader niche to explore
        
        Returns:
            List of micro-niche opportunities
        """
        prompt = f"""Find micro-niche opportunities within the broader niche: "{parent_niche}"

Micro-niches are highly specific sub-niches with less competition but dedicated audiences.
Example: "AI tools" → "AI tools for dentists" or "AI tools for wedding photographers"

Return a JSON object with this structure:
{{
    "parent_niche": "{parent_niche}",
    "micro_niches": [
        {{
            "name": "Specific micro-niche name",
            "description": "What this micro-niche covers",
            "opportunity_score": 85,
            "competition_level": "Low/Medium/High",
            "audience_size": "10K - 50K",
            "monetization_potential": "$500 - $2,000/month",
            "content_ideas": ["3 specific content ideas"],
            "keywords": ["Search terms for this micro-niche"],
            "difficulty": "Easy/Medium/Hard",
            "time_to_traction": "3-6 months"
        }}
    ],
    "emerging_niches": [
        {{
            "name": "Emerging micro-niche",
            "why_emerging": "Reason this is growing",
            "risk_level": "Low/Medium/High"
        }}
    ],
    "cross_niche_opportunities": [
        "Niches that could be combined for unique positioning"
    ],
    "recommendation": "Best micro-niche to start with and why"
}}"""
        
        result = self._generate(prompt, max_tokens=3000, json_mode=True)
        return json.loads(result)

    def find_related_niches(self, niche_name: str) -> dict:
        """
        Find related and adjacent niches for expansion.
        
        Args:
            niche_name: Current niche
        
        Returns:
            Related niche suggestions
        """
        prompt = f"""Find related and adjacent niches to: "{niche_name}"

These should be niches where the creator could naturally expand their content
or tap into overlapping audiences.

Return a JSON object with this structure:
{{
    "current_niche": "{niche_name}",
    "related_niches": [
        {{
            "name": "Related niche name",
            "relationship": "How it relates to current niche",
            "audience_overlap": "80%",
            "transition_difficulty": "Easy/Medium/Hard",
            "opportunity_score": 75
        }}
    ],
    "adjacent_niches": [
        {{
            "name": "Adjacent niche name",
            "why_adjacent": "Connection to current niche",
            "new_audience_potential": "Size of new audience"
        }}
    ],
    "expansion_strategy": "Recommended path to expand into new niches"
}}"""
        
        result = self._generate(prompt, max_tokens=2000, json_mode=True)
        return json.loads(result)

    def explore_trending_niches(self) -> dict:
        """
        Get currently trending/emerging niches for content creation.
        
        Returns:
            List of trending niches with analysis
        """
        prompt = """Identify the top 10 trending and emerging content creation niches right now.

Focus on niches that are:
1. Growing rapidly
2. Have monetization potential
3. Still have room for new creators

Return a JSON object with this structure:
{
    "trending_niches": [
        {
            "rank": 1,
            "name": "Niche name",
            "category": "Tech/Lifestyle/Finance/Health/etc",
            "growth_rate": "Very High/High/Medium",
            "demand_score": 90,
            "competition_score": 50,
            "opportunity_score": 85,
            "why_trending": "Reason for the trend",
            "audience_size": "Growing - 2M+",
            "monetization_potential": "High",
            "best_platform": "YouTube/TikTok/Both",
            "content_ideas": ["2-3 content ideas"],
            "time_sensitive": true
        }
    ],
    "emerging_categories": [
        "Broader categories showing growth"
    ],
    "niches_to_avoid": [
        {
            "name": "Saturated niche",
            "reason": "Why to avoid"
        }
    ],
    "prediction": "Where content creation is heading in 6 months"
}"""
        
        result = self._generate(prompt, max_tokens=3000, json_mode=True)
        return json.loads(result)

    # ============ ANALYTICS & CONTENT SCORING METHODS ============
    
    def score_content_before_posting(self, content_data: dict) -> dict:
        """
        Score content before posting with predictions and improvement suggestions.
        
        Args:
            content_data: Dict with title, description, hook, thumbnail_text, platform
        
        Returns:
            Content score with suggestions
        """
        prompt = f"""Score this content before posting and provide improvement suggestions.

Content to Score:
- Title: {content_data.get('title', 'No title')}
- Hook/First 3 seconds: {content_data.get('hook', 'No hook provided')}
- Description: {content_data.get('description', 'No description')[:300]}
- Thumbnail Text: {content_data.get('thumbnail_text', 'No thumbnail text')}
- Platform: {content_data.get('platform', 'youtube')}
- Niche: {content_data.get('niche', 'General')}

Return a JSON object with this structure:
{{
    "overall_score": 75,
    "scores": {{
        "title_score": 80,
        "hook_score": 70,
        "thumbnail_score": 65,
        "seo_score": 75,
        "engagement_potential": 72
    }},
    "predictions": {{
        "estimated_ctr": "4-6%",
        "estimated_retention": "45-55%",
        "viral_potential": "Medium",
        "performance_bracket": "Above Average"
    }},
    "improvements": {{
        "title": {{
            "current_issue": "What's wrong with current title",
            "suggestion": "Improved title suggestion",
            "impact": "High/Medium/Low"
        }},
        "hook": {{
            "current_issue": "Hook weakness",
            "suggestion": "Better hook approach",
            "impact": "High/Medium/Low"
        }},
        "thumbnail": {{
            "current_issue": "Thumbnail text issue",
            "suggestion": "Better thumbnail text",
            "impact": "High/Medium/Low"
        }}
    }},
    "critical_fixes": [
        "Must-fix issues before posting"
    ],
    "strengths": [
        "What this content does well"
    ],
    "final_recommendation": "Post now / Improve first / Reconsider"
}}"""
        
        result = self._generate(prompt, max_tokens=2000, json_mode=True)
        return json.loads(result)

    def generate_weekly_insights(self, performance_data: dict) -> dict:
        """
        Generate AI insights from weekly performance data.
        
        Args:
            performance_data: Dict with this_week and last_week stats
        
        Returns:
            AI-generated insights and recommendations
        """
        prompt = f"""Analyze this creator's weekly performance and provide actionable insights.

This Week's Performance:
{json.dumps(performance_data.get('this_week', {}), indent=2)}

Last Week's Performance:
{json.dumps(performance_data.get('last_week', {}), indent=2)}

Top Performing Content:
{json.dumps(performance_data.get('top_content', [])[:5], indent=2)}

Return a JSON object with this structure:
{{
    "summary": "One paragraph summary of the week",
    "highlights": [
        "Key wins this week"
    ],
    "concerns": [
        "Areas that need attention"
    ],
    "trends": {{
        "views_trend": "Up/Down/Stable",
        "engagement_trend": "Up/Down/Stable",
        "growth_trajectory": "Description"
    }},
    "what_worked": [
        {{
            "element": "What worked well",
            "evidence": "How we know this",
            "recommendation": "How to replicate"
        }}
    ],
    "what_to_improve": [
        {{
            "issue": "Problem identified",
            "impact": "High/Medium/Low",
            "solution": "How to fix it"
        }}
    ],
    "next_week_focus": [
        "Priority 1 for next week",
        "Priority 2 for next week"
    ],
    "content_recommendations": [
        "Specific content to create next week"
    ],
    "motivational_note": "Encouraging message based on the data"
}}"""
        
        result = self._generate(prompt, max_tokens=2500, json_mode=True)
        return json.loads(result)

    def suggest_ab_tests(self, content_data: dict) -> dict:
        """
        Suggest A/B tests for content optimization.
        
        Args:
            content_data: Information about the content type and current approach
        
        Returns:
            A/B test suggestions
        """
        prompt = f"""Suggest A/B tests to optimize content performance.

Content Type: {content_data.get('content_type', 'video')}
Current Niche: {content_data.get('niche', 'General')}
Current Approach: {content_data.get('current_approach', 'Standard content creation')}
Main Goal: {content_data.get('goal', 'Increase views and engagement')}

Return a JSON object with this structure:
{{
    "ab_test_suggestions": [
        {{
            "test_name": "Name of the test",
            "variable": "What you're testing (hook/thumbnail/title/etc)",
            "version_a": "Control version description",
            "version_b": "Test version description",
            "hypothesis": "Why we think B might perform better",
            "success_metric": "How to measure success",
            "sample_size_needed": "Minimum views/posts needed",
            "expected_impact": "High/Medium/Low",
            "difficulty": "Easy/Medium/Hard"
        }}
    ],
    "priority_order": [
        "Which test to run first and why"
    ],
    "testing_tips": [
        "Best practices for running these tests"
    ],
    "common_mistakes": [
        "Mistakes to avoid when A/B testing content"
    ]
}}"""
        
        result = self._generate(prompt, max_tokens=2000, json_mode=True)
        return json.loads(result)

    # ============ COLLABORATION METHODS ============
    
    def generate_pitch_template(self, sender_profile: dict, receiver_profile: dict) -> dict:
        """
        Generate a personalized pitch message for collaboration.
        
        Args:
            sender_profile: Sender's creator profile
            receiver_profile: Receiver's creator profile
        
        Returns:
            Pitch templates and customization tips
        """
        prompt = f"""Generate a personalized collaboration pitch message.

SENDER (You):
- Name: {sender_profile.get('display_name', 'Creator')}
- Niche: {sender_profile.get('niche', 'General')}
- Audience Size: {sender_profile.get('audience_size', 0):,}
- Content Style: {sender_profile.get('content_style', 'Unknown')}
- Platforms: {', '.join(sender_profile.get('platforms', {}).keys())}

RECEIVER (Target Collaborator):
- Name: {receiver_profile.get('display_name', 'Creator')}
- Niche: {receiver_profile.get('niche', 'General')}
- Audience Size: {receiver_profile.get('audience_size', 0):,}
- Content Style: {receiver_profile.get('content_style', 'Unknown')}
- Bio: {receiver_profile.get('bio', 'No bio')[:200]}

Return a JSON object with this structure:
{{
    "pitch_templates": [
        {{
            "title": "Template name (e.g., 'Professional', 'Casual', 'Value-First')",
            "message": "Full pitch message text (150-250 words)",
            "tone": "Professional/Casual/Enthusiastic"
        }}
    ],
    "key_hooks": [
        "Specific value proposition to emphasize"
    ],
    "personalization_tips": [
        "How to customize this pitch futher"
    ],
    "things_to_avoid": [
        "Common mistakes when pitching"
    ],
    "follow_up_suggestion": "What to say if no response after a week"
}}"""
        
        result = self._generate(prompt, max_tokens=2500, json_mode=True)
        return json.loads(result)

    def generate_collab_ideas(self, profile_a: dict, profile_b: dict) -> dict:
        """
        Generate collaboration ideas for two creators.
        
        Args:
            profile_a: First creator's profile
            profile_b: Second creator's profile
        
        Returns:
            Collaboration concepts and execution tips
        """
        prompt = f"""Generate creative collaboration ideas for these two creators.

CREATOR A:
- Name: {profile_a.get('display_name', 'Creator A')}
- Niche: {profile_a.get('niche', 'General')}
- Sub-niches: {', '.join(profile_a.get('sub_niches', []))}
- Content Style: {profile_a.get('content_style', 'Unknown')}
- Audience: {profile_a.get('audience_size', 0):,}
- Platforms: {', '.join(profile_a.get('platforms', {}).keys())}

CREATOR B:
- Name: {profile_b.get('display_name', 'Creator B')}
- Niche: {profile_b.get('niche', 'General')}
- Sub-niches: {', '.join(profile_b.get('sub_niches', []))}
- Content Style: {profile_b.get('content_style', 'Unknown')}
- Audience: {profile_b.get('audience_size', 0):,}
- Platforms: {', '.join(profile_b.get('platforms', {}).keys())}

Return a JSON object with this structure:
{{
    "collab_ideas": [
        {{
            "title": "Collaboration concept title",
            "description": "Detailed description of the collab idea",
            "format": "Video/Live stream/Series/Challenge/etc",
            "platform": "Best platform for this collab",
            "estimated_reach": "Combined audience potential",
            "effort_level": "Low/Medium/High",
            "viral_potential": "Low/Medium/High",
            "execution_steps": [
                "Step 1: ...",
                "Step 2: ..."
            ]
        }}
    ],
    "unique_angles": [
        "What makes this pairing special"
    ],
    "cross_promotion_strategy": "How to maximize exposure for both",
    "content_split": "Suggested content division between creators"
}}"""
        
        result = self._generate(prompt, max_tokens=3000, json_mode=True)
        return json.loads(result)

    def analyze_collab_compatibility(self, profile_a: dict, profile_b: dict, match_score: float) -> dict:
        """
        Generate AI analysis of collaboration compatibility.
        
        Args:
            profile_a: First creator's profile
            profile_b: Second creator's profile
            match_score: Calculated match score
        
        Returns:
            Detailed compatibility analysis
        """
        prompt = f"""Analyze the collaboration potential between these two creators.

CREATOR A:
- Name: {profile_a.get('display_name', 'Creator A')}
- Niche: {profile_a.get('niche', 'General')}
- Audience: {profile_a.get('audience_size', 0):,}
- Style: {profile_a.get('content_style', 'Unknown')}
- Collab Interests: {', '.join(profile_a.get('collab_interests', []))}

CREATOR B:
- Name: {profile_b.get('display_name', 'Creator B')}
- Niche: {profile_b.get('niche', 'General')}
- Audience: {profile_b.get('audience_size', 0):,}
- Style: {profile_b.get('content_style', 'Unknown')}
- Collab Interests: {', '.join(profile_b.get('collab_interests', []))}

Current Match Score: {match_score}/100

Return a JSON object with this structure:
{{
    "compatibility_summary": "One paragraph summary of their potential",
    "strengths": [
        "Why this collab could work well"
    ],
    "challenges": [
        "Potential obstacles to consider"
    ],
    "audience_overlap_analysis": "How their audiences might interact",
    "content_synergy": "How their content styles complement each other",
    "growth_potential": {{
        "creator_a": "Expected benefit for Creator A",
        "creator_b": "Expected benefit for Creator B"
    }},
    "best_collab_types": [
        "Most suitable collaboration formats"
    ],
    "risk_level": "Low/Medium/High",
    "recommendation": "Final recommendation on proceeding"
}}"""
        
        result = self._generate(prompt, max_tokens=2000, json_mode=True)
        return json.loads(result)
