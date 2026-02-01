const mongoose = require('mongoose');

const mealSchema = {
  name: String,
  calories: Number,
  emoji: String
};

const dayMealsSchema = {
  Breakfast: mealSchema,
  Lunch: mealSchema,
  Dinner: mealSchema
};

const mealPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  weeklyPlan: {
    Monday: dayMealsSchema,
    Tuesday: dayMealsSchema,
    Wednesday: dayMealsSchema,
    Thursday: dayMealsSchema,
    Friday: dayMealsSchema,
    Saturday: dayMealsSchema,
    Sunday: dayMealsSchema
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MealPlan', mealPlanSchema);
