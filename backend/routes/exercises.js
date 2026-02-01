const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get exercises data
const getExercisesByPlan = (plan) => {
  const allExercises = {
    "weight-loss": [
      {
        name: "Cardio Running",
        description: "Moderate to high-intensity running helps burn calories and improve cardiovascular health. Start with 20-30 minutes.",
        emoji: "🏃",
        sets: "N/A",
        reps: "N/A",
        duration: "20-45 minutes",
        frequency: "4-5 times/week",
      },
      {
        name: "HIIT Workout",
        description: "High-Intensity Interval Training alternates between intense bursts and recovery periods. Very effective for weight loss.",
        emoji: "⚡",
        sets: "4-6 rounds",
        reps: "30-60 sec intervals",
        duration: "20-30 minutes",
        frequency: "3-4 times/week",
      },
      {
        name: "Cycling",
        description: "Low-impact cardio exercise that burns calories while being gentle on joints. Great for beginners.",
        emoji: "🚴",
        sets: "N/A",
        reps: "N/A",
        duration: "30-60 minutes",
        frequency: "4-5 times/week",
      },
      {
        name: "Jump Rope",
        description: "Simple yet effective cardio exercise that burns calories quickly. Can be done anywhere.",
        emoji: "🦘",
        sets: "5-10 sets",
        reps: "30-60 seconds",
        duration: "15-20 minutes",
        frequency: "5-6 times/week",
      },
      {
        name: "Swimming",
        description: "Full-body workout that burns calories while being easy on joints. Excellent for weight loss.",
        emoji: "🏊",
        sets: "N/A",
        reps: "N/A",
        duration: "30-45 minutes",
        frequency: "3-4 times/week",
      },
      {
        name: "Bodyweight Circuit",
        description: "Combination of push-ups, squats, lunges, and planks. No equipment needed, burns calories effectively.",
        emoji: "💪",
        sets: "3-4 rounds",
        reps: "10-15 each",
        duration: "20-30 minutes",
        frequency: "4-5 times/week",
      },
    ],
    "weight-gain": [
      {
        name: "Compound Lifts",
        description: "Squats, deadlifts, and bench presses work multiple muscle groups. Essential for building mass.",
        emoji: "🏋️",
        sets: "4-5 sets",
        reps: "6-10 reps",
        duration: "45-60 minutes",
        frequency: "3-4 times/week",
      },
      {
        name: "Progressive Overload",
        description: "Gradually increase weight or reps over time. Key principle for muscle and weight gain.",
        emoji: "📈",
        sets: "3-5 sets",
        reps: "8-12 reps",
        duration: "60 minutes",
        frequency: "4-5 times/week",
      },
      {
        name: "Isolation Exercises",
        description: "Target specific muscle groups with bicep curls, tricep extensions, and leg curls.",
        emoji: "🎯",
        sets: "3-4 sets",
        reps: "10-15 reps",
        duration: "30-45 minutes",
        frequency: "4-5 times/week",
      },
      {
        name: "Resistance Training",
        description: "Use weights, resistance bands, or bodyweight to build muscle mass and strength.",
        emoji: "🏋️‍♀️",
        sets: "3-5 sets",
        reps: "8-12 reps",
        duration: "45-60 minutes",
        frequency: "4-5 times/week",
      },
      {
        name: "Full Body Workout",
        description: "Work all major muscle groups in one session. Great for overall muscle development.",
        emoji: "🔥",
        sets: "3-4 sets",
        reps: "8-12 reps",
        duration: "60 minutes",
        frequency: "3-4 times/week",
      },
    ],
    "fat-loss": [
      {
        name: "Strength Training",
        description: "Build muscle to increase metabolism. More muscle means more calories burned at rest.",
        emoji: "💪",
        sets: "3-4 sets",
        reps: "8-12 reps",
        duration: "45 minutes",
        frequency: "3-4 times/week",
      },
      {
        name: "Circuit Training",
        description: "Combine strength and cardio exercises in quick succession. Burns fat while building muscle.",
        emoji: "🔄",
        sets: "3-5 rounds",
        reps: "10-15 each",
        duration: "30-40 minutes",
        frequency: "4-5 times/week",
      },
      {
        name: "Rowing",
        description: "Full-body cardio exercise that builds strength while burning calories. Excellent for fat loss.",
        emoji: "🚣",
        sets: "N/A",
        reps: "N/A",
        duration: "20-30 minutes",
        frequency: "4-5 times/week",
      },
      {
        name: "Stair Climbing",
        description: "High-intensity exercise that targets legs and glutes while burning significant calories.",
        emoji: "📶",
        sets: "5-10 sets",
        reps: "2-3 minutes",
        duration: "20-30 minutes",
        frequency: "4-5 times/week",
      },
      {
        name: "Kettlebell Swings",
        description: "Explosive full-body movement that builds power and burns fat effectively.",
        emoji: "⚖️",
        sets: "4-5 sets",
        reps: "15-20 reps",
        duration: "20-30 minutes",
        frequency: "3-4 times/week",
      },
      {
        name: "Yoga Flow",
        description: "Dynamic yoga sequences that build strength, flexibility, and burn calories.",
        emoji: "🧘",
        sets: "N/A",
        reps: "N/A",
        duration: "30-45 minutes",
        frequency: "4-5 times/week",
      },
    ],
    "muscle-building": [
      {
        name: "Heavy Lifting",
        description: "Focus on compound movements with heavy weights. Squats, deadlifts, bench press, and rows.",
        emoji: "🏋️",
        sets: "4-6 sets",
        reps: "4-8 reps",
        duration: "60-90 minutes",
        frequency: "4-5 times/week",
      },
      {
        name: "Progressive Overload",
        description: "Systematically increase weight, reps, or sets over time. Essential for muscle growth.",
        emoji: "📈",
        sets: "3-5 sets",
        reps: "6-12 reps",
        duration: "60 minutes",
        frequency: "4-6 times/week",
      },
      {
        name: "Split Training",
        description: "Focus on different muscle groups each day. Allows for better recovery and growth.",
        emoji: "🎯",
        sets: "4-5 sets",
        reps: "8-12 reps",
        duration: "60 minutes",
        frequency: "5-6 times/week",
      },
      {
        name: "Isolation Exercises",
        description: "Target specific muscles with focused movements. Bicep curls, tricep extensions, leg curls.",
        emoji: "🎯",
        sets: "3-4 sets",
        reps: "10-15 reps",
        duration: "30-45 minutes",
        frequency: "5-6 times/week",
      },
      {
        name: "Pull-Ups & Dips",
        description: "Bodyweight exercises that build upper body strength. Excellent for muscle building.",
        emoji: "🤸",
        sets: "3-5 sets",
        reps: "8-12 reps",
        duration: "20-30 minutes",
        frequency: "3-4 times/week",
      },
      {
        name: "Leg Day Focus",
        description: "Dedicated leg training with squats, lunges, and leg presses. Builds lower body mass.",
        emoji: "🦵",
        sets: "4-5 sets",
        reps: "8-12 reps",
        duration: "60 minutes",
        frequency: "2 times/week",
      },
    ],
  };

  return allExercises[plan] || [];
};

// Get personalized exercises
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || !user.profile || !user.profile.plan) {
      return res.json({ 
        exercises: [],
        message: 'Please select a fitness plan in your profile to get exercise recommendations'
      });
    }

    const exercises = getExercisesByPlan(user.profile.plan);
    res.json({ exercises });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
