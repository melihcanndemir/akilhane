#!/usr/bin/env python3
"""
🎮 AkılHane CI/CD Game Score Tracker
Tracks XP, achievements, and mission completion
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional

class GameScoreTracker:
    def __init__(self, score_file: str = "game-scores.json"):
        self.score_file = score_file
        self.scores = self.load_scores()
    
    def load_scores(self) -> Dict:
        """Load existing scores from file"""
        if os.path.exists(self.score_file):
            try:
                with open(self.score_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                pass
        return {
            "total_xp": 0,
            "missions_completed": 0,
            "achievements": [],
            "history": [],
            "level": 1
        }
    
    def save_scores(self):
        """Save scores to file"""
        with open(self.score_file, 'w', encoding='utf-8') as f:
            json.dump(self.scores, f, indent=2, ensure_ascii=False)
    
    def add_xp(self, xp: int, mission: str, details: str = ""):
        """Add XP for completed mission"""
        self.scores["total_xp"] += xp
        self.scores["missions_completed"] += 1
        
        # Add to history
        history_entry = {
            "timestamp": datetime.now().isoformat(),
            "mission": mission,
            "xp_earned": xp,
            "details": details
        }
        self.scores["history"].append(history_entry)
        
        # Check for level up
        new_level = (self.scores["total_xp"] // 1000) + 1
        if new_level > self.scores["level"]:
            self.scores["level"] = new_level
            print(f"🎉 LEVEL UP! You are now level {new_level}!")
        
        # Check for achievements
        self.check_achievements()
        
        self.save_scores()
        self.display_score()
    
    def check_achievements(self):
        """Check for new achievements"""
        achievements = [
            {"name": "First Mission", "condition": lambda: self.scores["missions_completed"] >= 1, "xp": 50},
            {"name": "Code Quality Master", "condition": lambda: self.scores["missions_completed"] >= 10, "xp": 200},
            {"name": "Type Safety Expert", "condition": lambda: self.scores["missions_completed"] >= 20, "xp": 300},
            {"name": "Build Master", "condition": lambda: self.scores["missions_completed"] >= 30, "xp": 400},
            {"name": "AI Integration Expert", "condition": lambda: self.scores["missions_completed"] >= 50, "xp": 500},
            {"name": "Deployment Hero", "condition": lambda: self.scores["missions_completed"] >= 100, "xp": 1000},
        ]
        
        for achievement in achievements:
            if (achievement["name"] not in self.scores["achievements"] and 
                achievement["condition"]()):
                self.scores["achievements"].append(achievement["name"])
                self.scores["total_xp"] += achievement["xp"]
                print(f"🏆 ACHIEVEMENT UNLOCKED: {achievement['name']} (+{achievement['xp']} XP)")
    
    def display_score(self):
        """Display current score and stats"""
        print("\n🎮 AKILHANE CI/CD GAME SCORE")
        print("=" * 40)
        print(f"🏆 Total XP: {self.scores['total_xp']}")
        print(f"⭐ Level: {self.scores['level']}")
        print(f"🎯 Missions Completed: {self.scores['missions_completed']}")
        print(f"🏅 Achievements: {len(self.scores['achievements'])}")
        
        if self.scores["achievements"]:
            print("\n🏅 Achievements:")
            for achievement in self.scores["achievements"]:
                print(f"  ✅ {achievement}")
        
        if self.scores["history"]:
            print(f"\n📜 Recent Missions:")
            for entry in self.scores["history"][-3:]:
                print(f"  🎯 {entry['mission']} (+{entry['xp_earned']} XP)")
        
        print("=" * 40)

def main():
    """Main function for game score tracking"""
    tracker = GameScoreTracker()
    
    # Example usage
    print("🎮 AkılHane CI/CD Game Score Tracker")
    print("=" * 50)
    
    # Simulate some missions
    missions = [
        {"name": "Lint Check", "xp": 100, "details": "Code quality check passed"},
        {"name": "Type Check", "xp": 150, "details": "TypeScript types are safe"},
        {"name": "Build Check", "xp": 200, "details": "Production build successful"},
        {"name": "AI Flow Test", "xp": 300, "details": "AI flows are working"},
        {"name": "Deploy Mission", "xp": 500, "details": "Deployed to production"}
    ]
    
    for mission in missions:
        tracker.add_xp(mission["xp"], mission["name"], mission["details"])
        print(f"\n🎯 Mission completed: {mission['name']}")
        print(f"✅ {mission['details']}")
        print(f"🏆 +{mission['xp']} XP earned!")

if __name__ == "__main__":
    main() 