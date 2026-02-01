const express = require("express");
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const auth = require("../middleware/auth");
const { getMealsByDietAndPlan } = require("../utils/meals");
const router = express.Router();

// Get personalized meals
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || !user.profile || !user.profile.diet) {
      return res.json({
        meals: [],
        message:
          "Please complete your profile with diet type to get meal suggestions",
      });
    }

    if (!user.profile.plan) {
      return res.json({
        meals: [],
        message:
          "Please select a fitness plan in your profile to get meal suggestions",
      });
    }

    const meals = getMealsByDietAndPlan(user.profile.diet, user.profile.plan);
    res.json({ meals });
  } catch (error) {
    console.error("Get meals error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get community recipes
router.get("/community", auth, async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "profile.name");
    res.json({ recipes });
  } catch (error) {
    console.error("Get community recipes error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

// Add new recipe
router.post("/", auth, async (req, res) => {
  try {
    const {
      name,
      description,
      ingredients,
      instructions,
      calories,
      diet,
      emoji,
    } = req.body;

    const recipe = new Recipe({
      name,
      description,
      ingredients,
      instructions,
      calories,
      diet,
      emoji: emoji || "🍲",
      createdBy: req.user._id,
    });

    await recipe.save();
    res.status(201).json({ message: "Recipe added successfully", recipe });
  } catch (error) {
    console.error("Add recipe error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
