const express = require('express');
const MealPlan = require('../models/MealPlan');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { getMealsByDietAndPlan } = require('../utils/meals');
const router = express.Router();

// Get meal plan
router.get('/', auth, async (req, res) => {
  try {
    let mealPlan = await MealPlan.findOne({ user: req.user._id });
    
    if (!mealPlan || !mealPlan.weeklyPlan || Object.keys(mealPlan.weeklyPlan).length === 0) {
      return res.json({ weeklyPlan: {} });
    }

    res.json({ weeklyPlan: mealPlan.weeklyPlan });
  } catch (error) {
    console.error('Get meal plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate meal plan
router.post('/generate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || !user.profile || !user.profile.diet || !user.profile.plan) {
      return res.status(400).json({ 
        message: 'Please complete your profile with diet type and fitness plan first!'
      });
    }

    const availableMeals = getMealsByDietAndPlan(user.profile.diet, user.profile.plan);

    if (availableMeals.length === 0) {
      return res.status(400).json({ 
        message: 'No meals available for your diet type and plan. Please check your profile settings.'
      });
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
    const weeklyPlan = {};

    days.forEach((day) => {
      weeklyPlan[day] = {
        Breakfast: null,
        Lunch: null,
        Dinner: null,
      };

      mealTypes.forEach((mealType) => {
        const randomMeal = availableMeals[Math.floor(Math.random() * availableMeals.length)];
        weeklyPlan[day][mealType] = {
          name: randomMeal.name,
          calories: parseInt(randomMeal.calories),
          emoji: randomMeal.emoji,
        };
      });
    });

    // Save or update meal plan
    let mealPlan = await MealPlan.findOne({ user: req.user._id });
    if (mealPlan) {
      mealPlan.weeklyPlan = weeklyPlan;
      await mealPlan.save();
    } else {
      mealPlan = new MealPlan({
        user: req.user._id,
        weeklyPlan: weeklyPlan
      });
      await mealPlan.save();
    }

    res.json({ 
      message: 'Weekly meal plan generated successfully!',
      weeklyPlan 
    });
  } catch (error) {
    console.error('Generate meal plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear meal plan
router.delete('/', auth, async (req, res) => {
  try {
    await MealPlan.findOneAndDelete({ user: req.user._id });
    res.json({ message: 'Meal plan cleared successfully' });
  } catch (error) {
    console.error('Clear meal plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
