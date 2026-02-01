# Required Changes Summary

## Critical Fixes Needed

### 1. Fix Meal Planner (script.js)
- Line 505: Change `data.mealPlan` to `data.weeklyPlan`
- Line 528: Change `data.mealPlan` to `data.weeklyPlan`  
- Line 549: Change `mealPlan[day]` to `mealPlan[day] || {}`

### 2. Add Recipe Functionality
- Add recipes to all meals in backend/utils/meals.js
- Add recipe modal to index.html
- Update loadMeals() to show recipe button and handle clicks
- Add showRecipe() function to display recipe modal

### 3. Add Doctor Profile Form
- Add doctor profile page to index.html (similar to user profile)
- Update setupDoctorView() to show profile page for doctors
- Allow doctors to edit their name and specialization

### 4. Dynamic Doctor Loading for Appointments
- Update loadDoctors() function to fetch from /api/doctors
- Update consultation page to load doctors dynamically
- Store doctor ID instead of hardcoded values

## Files Modified
- script.js (meal planner fixes, recipe functionality, doctor profile, dynamic doctor loading)
- index.html (recipe modal, doctor profile page)
- backend/utils/meals.js (add recipes to all meals)
- backend/routes/doctors.js (already created)
- backend/server.js (already updated with doctors route)
