from datetime import datetime, timedelta
from app.extensions import db
from app.models.sql.content_performance import ContentPerformance, ABTest
from app.models.sql.content_script import ContentScript


class AnalyticsService:
    """
    Service for content analytics, ROI tracking, and performance insights.
    Helps users measure the value of platform recommendations.
    """

    def track_content_performance(self, user_id: int, data: dict) -> dict:
        """
        Track or update content performance metrics.
        """
        # Check if already tracking this content
        existing = None
        if data.get("video_id"):
            existing = ContentPerformance.query.filter_by(
                user_id=user_id,
                video_id=data["video_id"]
            ).first()
        
        if existing:
            # Update existing record
            performance = existing
            performance.views = data.get("views", performance.views)
            performance.likes = data.get("likes", performance.likes)
            performance.comments = data.get("comments", performance.comments)
            performance.shares = data.get("shares", performance.shares)
            performance.watch_time_hours = data.get("watch_time_hours", performance.watch_time_hours)
            
            # Add performance snapshot
            performance.add_performance_snapshot({
                "views": performance.views,
                "likes": performance.likes,
                "comments": performance.comments
            })
        else:
            # Create new performance record
            performance = ContentPerformance(
                user_id=user_id,
                content_script_id=data.get("content_script_id"),
                title=data.get("title", "Untitled"),
                platform=data.get("platform", "youtube"),
                video_url=data.get("video_url"),
                video_id=data.get("video_id"),
                views=data.get("views", 0),
                likes=data.get("likes", 0),
                comments=data.get("comments", 0),
                shares=data.get("shares", 0),
                watch_time_hours=data.get("watch_time_hours", 0),
                used_platform_suggestion=data.get("used_platform_suggestion", False),
                suggestion_type=data.get("suggestion_type"),
                content_score=data.get("content_score")
            )
            
            # Parse published date
            if data.get("published_at"):
                try:
                    performance.published_at = datetime.fromisoformat(
                        data["published_at"].replace('Z', '+00:00')
                    )
                except:
                    performance.published_at = datetime.utcnow()
            
            db.session.add(performance)
        
        # Calculate metrics
        performance.calculate_engagement_rate()
        performance.calculate_estimated_revenue(data.get("cpm", 4.0))
        performance.calculate_actual_score()
        
        db.session.commit()
        
        return {
            "success": True,
            "performance": performance.to_dict()
        }

    def get_roi_analysis(self, user_id: int, days: int = 30) -> dict:
        """
        Calculate ROI by comparing content using platform suggestions vs not.
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Get content with platform suggestions
        with_suggestions = ContentPerformance.query.filter(
            ContentPerformance.user_id == user_id,
            ContentPerformance.used_platform_suggestion == True,
            ContentPerformance.created_at >= cutoff_date
        ).all()
        
        # Get content without platform suggestions
        without_suggestions = ContentPerformance.query.filter(
            ContentPerformance.user_id == user_id,
            ContentPerformance.used_platform_suggestion == False,
            ContentPerformance.created_at >= cutoff_date
        ).all()
        
        def calculate_averages(contents):
            if not contents:
                return {
                    "count": 0,
                    "avg_views": 0,
                    "avg_engagement": 0,
                    "avg_revenue": 0,
                    "total_revenue": 0
                }
            
            return {
                "count": len(contents),
                "avg_views": sum(c.views for c in contents) // len(contents),
                "avg_engagement": round(sum(c.engagement_rate for c in contents) / len(contents), 2),
                "avg_revenue": round(sum(c.estimated_revenue for c in contents) / len(contents), 2),
                "total_revenue": round(sum(c.estimated_revenue for c in contents), 2)
            }
        
        with_stats = calculate_averages(with_suggestions)
        without_stats = calculate_averages(without_suggestions)
        
        # Calculate improvement percentages
        improvement = {}
        if without_stats["avg_views"] > 0:
            improvement["views"] = round(
                ((with_stats["avg_views"] - without_stats["avg_views"]) / without_stats["avg_views"]) * 100, 1
            )
        else:
            improvement["views"] = 100 if with_stats["avg_views"] > 0 else 0
            
        if without_stats["avg_engagement"] > 0:
            improvement["engagement"] = round(
                ((with_stats["avg_engagement"] - without_stats["avg_engagement"]) / without_stats["avg_engagement"]) * 100, 1
            )
        else:
            improvement["engagement"] = 100 if with_stats["avg_engagement"] > 0 else 0
        
        return {
            "period_days": days,
            "with_suggestions": with_stats,
            "without_suggestions": without_stats,
            "improvement": improvement,
            "roi_summary": f"Content using platform suggestions performed {improvement.get('views', 0)}% better in views and {improvement.get('engagement', 0)}% better in engagement."
        }

    def get_weekly_report(self, user_id: int) -> dict:
        """
        Generate weekly performance report.
        """
        week_ago = datetime.utcnow() - timedelta(days=7)
        two_weeks_ago = datetime.utcnow() - timedelta(days=14)
        
        # This week's content
        this_week = ContentPerformance.query.filter(
            ContentPerformance.user_id == user_id,
            ContentPerformance.created_at >= week_ago
        ).all()
        
        # Last week's content (for comparison)
        last_week = ContentPerformance.query.filter(
            ContentPerformance.user_id == user_id,
            ContentPerformance.created_at >= two_weeks_ago,
            ContentPerformance.created_at < week_ago
        ).all()
        
        def week_stats(contents):
            if not contents:
                return {
                    "content_count": 0,
                    "total_views": 0,
                    "total_likes": 0,
                    "total_comments": 0,
                    "avg_engagement": 0,
                    "estimated_revenue": 0
                }
            
            return {
                "content_count": len(contents),
                "total_views": sum(c.views for c in contents),
                "total_likes": sum(c.likes for c in contents),
                "total_comments": sum(c.comments for c in contents),
                "avg_engagement": round(sum(c.engagement_rate for c in contents) / len(contents), 2),
                "estimated_revenue": round(sum(c.estimated_revenue for c in contents), 2)
            }
        
        this_week_stats = week_stats(this_week)
        last_week_stats = week_stats(last_week)
        
        # Find top performing content
        top_content = sorted(this_week, key=lambda x: x.views, reverse=True)[:5]
        
        # Find content score accuracy
        scored_content = [c for c in this_week if c.content_score and c.actual_score]
        avg_accuracy = 0
        if scored_content:
            avg_accuracy = sum(c.score_accuracy or 0 for c in scored_content) / len(scored_content)
        
        return {
            "report_period": {
                "start": week_ago.isoformat(),
                "end": datetime.utcnow().isoformat()
            },
            "this_week": this_week_stats,
            "last_week": last_week_stats,
            "week_over_week_change": {
                "views": self._calculate_change(this_week_stats["total_views"], last_week_stats["total_views"]),
                "engagement": self._calculate_change(this_week_stats["avg_engagement"], last_week_stats["avg_engagement"]),
                "revenue": self._calculate_change(this_week_stats["estimated_revenue"], last_week_stats["estimated_revenue"])
            },
            "top_performing_content": [c.to_dict() for c in top_content],
            "content_score_accuracy": round(avg_accuracy, 1),
            "generated_at": datetime.utcnow().isoformat()
        }

    def _calculate_change(self, current, previous):
        """Calculate percentage change between two values."""
        if previous == 0:
            return "+100%" if current > 0 else "0%"
        change = ((current - previous) / previous) * 100
        sign = "+" if change >= 0 else ""
        return f"{sign}{round(change, 1)}%"

    def create_ab_test(self, user_id: int, data: dict) -> dict:
        """
        Create a new A/B test comparing two content pieces.
        """
        ab_test = ABTest(
            user_id=user_id,
            test_name=data.get("test_name", "Untitled Test"),
            test_description=data.get("test_description"),
            test_variable=data.get("test_variable"),
            content_a_id=data.get("content_a_id"),
            content_b_id=data.get("content_b_id"),
            status="running",
            started_at=datetime.utcnow()
        )
        
        # Mark the content items with their A/B test groups
        if data.get("content_a_id"):
            content_a = ContentPerformance.query.get(data["content_a_id"])
            if content_a and content_a.user_id == user_id:
                content_a.ab_test_group = "A"
                content_a.ab_test_id = str(ab_test.id)
        
        if data.get("content_b_id"):
            content_b = ContentPerformance.query.get(data["content_b_id"])
            if content_b and content_b.user_id == user_id:
                content_b.ab_test_group = "B"
                content_b.ab_test_id = str(ab_test.id)
        
        db.session.add(ab_test)
        db.session.commit()
        
        return {
            "success": True,
            "ab_test": ab_test.to_dict()
        }

    def get_ab_test_results(self, test_id: int, user_id: int) -> dict:
        """
        Get A/B test results with comparison.
        """
        ab_test = ABTest.query.filter_by(id=test_id, user_id=user_id).first()
        
        if not ab_test:
            return None
        
        content_a = ab_test.content_a
        content_b = ab_test.content_b
        
        if not content_a or not content_b:
            return ab_test.to_dict()
        
        # Compare metrics
        comparison = {
            "views": {
                "A": content_a.views,
                "B": content_b.views,
                "winner": "A" if content_a.views > content_b.views else "B",
                "difference": abs(content_a.views - content_b.views)
            },
            "engagement": {
                "A": content_a.engagement_rate,
                "B": content_b.engagement_rate,
                "winner": "A" if content_a.engagement_rate > content_b.engagement_rate else "B",
                "difference": round(abs(content_a.engagement_rate - content_b.engagement_rate), 2)
            },
            "likes": {
                "A": content_a.likes,
                "B": content_b.likes,
                "winner": "A" if content_a.likes > content_b.likes else "B",
                "difference": abs(content_a.likes - content_b.likes)
            }
        }
        
        # Determine overall winner (based on views primarily)
        a_wins = sum(1 for metric in comparison.values() if metric["winner"] == "A")
        b_wins = sum(1 for metric in comparison.values() if metric["winner"] == "B")
        
        if a_wins > b_wins:
            ab_test.winner = "A"
        elif b_wins > a_wins:
            ab_test.winner = "B"
        else:
            ab_test.winner = "tie"
        
        # Calculate confidence (simplified - based on difference magnitude)
        view_diff_pct = (abs(content_a.views - content_b.views) / max(content_a.views, content_b.views, 1)) * 100
        ab_test.confidence_level = min(view_diff_pct, 99)
        
        ab_test.set_results_summary(comparison)
        
        # Mark as completed if enough data
        if content_a.views >= 1000 and content_b.views >= 1000:
            ab_test.status = "completed"
            ab_test.completed_at = datetime.utcnow()
        
        db.session.commit()
        
        return ab_test.to_dict()

    def get_revenue_attribution(self, user_id: int, days: int = 30) -> dict:
        """
        Break down revenue by suggestion type.
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        contents = ContentPerformance.query.filter(
            ContentPerformance.user_id == user_id,
            ContentPerformance.created_at >= cutoff_date
        ).all()
        
        # Group by suggestion type
        by_type = {}
        for content in contents:
            suggestion_type = content.suggestion_type or "none"
            if suggestion_type not in by_type:
                by_type[suggestion_type] = {
                    "count": 0,
                    "total_revenue": 0,
                    "total_views": 0
                }
            
            by_type[suggestion_type]["count"] += 1
            by_type[suggestion_type]["total_revenue"] += content.estimated_revenue
            by_type[suggestion_type]["total_views"] += content.views
        
        # Round values
        for key in by_type:
            by_type[key]["total_revenue"] = round(by_type[key]["total_revenue"], 2)
        
        total_revenue = sum(t["total_revenue"] for t in by_type.values())
        
        return {
            "period_days": days,
            "total_revenue": round(total_revenue, 2),
            "by_suggestion_type": by_type,
            "top_revenue_source": max(by_type.items(), key=lambda x: x[1]["total_revenue"])[0] if by_type else "none"
        }

    def get_user_content_history(self, user_id: int, limit: int = 20, offset: int = 0) -> dict:
        """
        Get user's tracked content history.
        """
        contents = ContentPerformance.query.filter_by(user_id=user_id)\
            .order_by(ContentPerformance.created_at.desc())\
            .offset(offset)\
            .limit(limit)\
            .all()
        
        total = ContentPerformance.query.filter_by(user_id=user_id).count()
        
        return {
            "contents": [c.to_dict() for c in contents],
            "total": total,
            "limit": limit,
            "offset": offset
        }
