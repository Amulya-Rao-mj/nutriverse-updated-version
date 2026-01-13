// User data storage (using localStorage)
const STORAGE_KEY = "nutriverse_users";
const CURRENT_USER_KEY = "nutriverse_current_user";

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  setupEventListeners();
});

// Check if user is logged in
function checkAuth() {
  const currentUser = localStorage.getItem(CURRENT_USER_KEY);
  if (currentUser) {
    showDashboard();
    loadUserProfile();
  } else {
    showAuth();
  }
}

// Setup event listeners
function setupEventListeners() {
  // Auth form switching
  document.getElementById("show-signup").addEventListener("click", (e) => {
    e.preventDefault();
    switchAuthForm("signup");
  });

  document.getElementById("show-login").addEventListener("click", (e) => {
    e.preventDefault();
    switchAuthForm("login");
  });

  // Form submissions
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document
    .getElementById("signupForm")
    .addEventListener("submit", handleSignup);
  document
    .getElementById("profileForm")
    .addEventListener("submit", handleProfileSave);

  // Navigation
  document.querySelectorAll(".nav-btn[data-page]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const page = e.target.getAttribute("data-page");
      switchPage(page);
    });
  });

  document.getElementById("logout-btn").addEventListener("click", handleLogout);

  // Meal planner
  const generateBtn = document.getElementById("generate-meal-plan");
  const clearBtn = document.getElementById("clear-meal-plan");
  if (generateBtn) {
    generateBtn.addEventListener("click", generateWeeklyMealPlan);
  }
  if (clearBtn) {
    clearBtn.addEventListener("click", clearMealPlan);
  }

  // Consultation
  const consultationForm = document.getElementById("consultationForm");
  if (consultationForm) {
    consultationForm.addEventListener("submit", handleConsultationBooking);
  }
}

// Switch between login and signup forms
function switchAuthForm(form) {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  if (form === "signup") {
    loginForm.classList.remove("active");
    signupForm.classList.add("active");
  } else {
    signupForm.classList.remove("active");
    loginForm.classList.add("active");
  }
}

// Handle login
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, email);
    showDashboard();
    loadUserProfile();
    document.getElementById("loginForm").reset();
  } else {
    alert("Invalid email or password!");
  }
}

// Handle signup
function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  const users = getUsers();

  if (users.find((u) => u.email === email)) {
    alert("Email already registered!");
    return;
  }

  const newUser = {
    email,
    password,
    profile: {
      name,
      age: "",
      gender: "",
      diet: "",
      height: "",
      weight: "",
      plan: "",
    },
  };

  users.push(newUser);
  saveUsers(users);
  localStorage.setItem(CURRENT_USER_KEY, email);

  showDashboard();
  loadUserProfile();
  document.getElementById("signupForm").reset();
}

// Handle profile save
function handleProfileSave(e) {
  e.preventDefault();
  const profile = {
    name: document.getElementById("profile-name").value,
    age: document.getElementById("profile-age").value,
    gender: document.getElementById("profile-gender").value,
    diet: document.getElementById("profile-diet").value,
    height: document.getElementById("profile-height").value,
    weight: document.getElementById("profile-weight").value,
    plan: document.getElementById("profile-plan").value,
  };

  const users = getUsers();
  const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
  const userIndex = users.findIndex((u) => u.email === currentUserEmail);

  if (userIndex !== -1) {
    users[userIndex].profile = profile;
    saveUsers(users);
    updateBMI();
    alert("Profile saved successfully!");
    loadMeals(); // Refresh meals when profile is updated
    loadExercises(); // Refresh exercises when profile is updated
  }
}

// Load user profile
function loadUserProfile() {
  const users = getUsers();
  const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
  const user = users.find((u) => u.email === currentUserEmail);

  if (user && user.profile) {
    const profile = user.profile;
    document.getElementById("profile-name").value = profile.name || "";
    document.getElementById("profile-age").value = profile.age || "";
    document.getElementById("profile-gender").value = profile.gender || "";
    document.getElementById("profile-diet").value = profile.diet || "";
    document.getElementById("profile-height").value = profile.height || "";
    document.getElementById("profile-weight").value = profile.weight || "";
    document.getElementById("profile-plan").value = profile.plan || "";

    updateBMI();
    loadMeals();
    loadExercises();
  }
}

// Update BMI display
function updateBMI() {
  const height = parseFloat(document.getElementById("profile-height").value);
  const weight = parseFloat(document.getElementById("profile-weight").value);
  const bmiDisplay = document.getElementById("bmi-display");

  if (height && weight && height > 0 && weight > 0) {
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

    let category = "";
    let color = "";

    if (bmi < 18.5) {
      category = "Underweight";
      color = "#2196F3";
    } else if (bmi < 25) {
      category = "Normal";
      color = "#4CAF50";
    } else if (bmi < 30) {
      category = "Overweight";
      color = "#FF9800";
    } else {
      category = "Obese";
      color = "#F44336";
    }

    bmiDisplay.innerHTML = `
            <h3>Your BMI: ${bmi}</h3>
            <p>Category: ${category}</p>
        `;
    bmiDisplay.style.background = `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`;
  } else {
    bmiDisplay.innerHTML = "";
  }
}

// Load meals based on diet type and plan
function loadMeals() {
  const users = getUsers();
  const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
  const user = users.find((u) => u.email === currentUserEmail);

  const mealsContainer = document.getElementById("meals-container");

  if (!user || !user.profile || !user.profile.diet) {
    mealsContainer.innerHTML = `
            <div class="empty-state">
                <h3>Complete Your Profile</h3>
                <p>Please fill in your diet type in the profile section to get personalized meal suggestions.</p>
            </div>
        `;
    return;
  }

  if (!user.profile.plan) {
    mealsContainer.innerHTML = `
            <div class="empty-state">
                <h3>Select Your Fitness Plan</h3>
                <p>Please select a fitness plan in your profile to get personalized meal suggestions.</p>
            </div>
        `;
    return;
  }

  const diet = user.profile.diet;
  const plan = user.profile.plan;
  const meals = getMealsByDietAndPlan(diet, plan);

  if (meals.length === 0) {
    mealsContainer.innerHTML = `
            <div class="empty-state">
                <h3>No Meals Available</h3>
                <p>We're working on adding more meal suggestions for your diet type and plan.</p>
            </div>
        `;
    return;
  }

  mealsContainer.innerHTML = meals
    .map(
      (meal) => `
        <div class="meal-card">
            <div class="meal-image">${meal.emoji}</div>
            <div class="meal-content">
                <h3 class="meal-title">${meal.name}</h3>
                <p class="meal-description">${meal.description}</p>
                <div class="meal-tags">
                    <span class="meal-tag ${meal.diet}">${meal.dietLabel}</span>
                    <span class="meal-tag">${meal.calories} cal</span>
                    <span class="meal-tag">${meal.planLabel}</span>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// Get meals by diet type and plan
function getMealsByDietAndPlan(diet, plan) {
  const allMeals = {
    veg: [
      {
        name: "Vegetable Stir Fry",
        description:
          "Fresh seasonal vegetables stir-fried with garlic, ginger, and light soy sauce. Low calorie, high fiber.",
        emoji: "🥗",
        diet: "veg",
        dietLabel: "Vegetarian",
        calories: 180,
        plans: ["weight-loss", "fat-loss"],
      },
      {
        name: "Chana Masala",
        description:
          "Spiced chickpeas cooked in a tangy tomato-based gravy, rich in protein. Perfect for muscle building.",
        emoji: "🍲",
        diet: "veg",
        dietLabel: "Vegetarian",
        calories: 350,
        plans: ["muscle-building", "weight-gain"],
      },
      {
        name: "Paneer Tikka",
        description:
          "Marinated cottage cheese cubes grilled to perfection. High protein, moderate calories.",
        emoji: "🍢",
        diet: "veg",
        dietLabel: "Vegetarian",
        calories: 320,
        plans: ["muscle-building", "weight-gain", "fat-loss"],
      },
      {
        name: "Vegetable Biryani",
        description:
          "Aromatic basmati rice cooked with mixed vegetables, spices, and herbs. A complete meal packed with nutrients.",
        emoji: "🍛",
        diet: "veg",
        dietLabel: "Vegetarian",
        calories: 450,
        plans: ["weight-gain", "muscle-building"],
      },
      {
        name: "Dal Makhani",
        description:
          "Creamy black lentils cooked with butter and spices. High protein, good for muscle building.",
        emoji: "🥘",
        diet: "veg",
        dietLabel: "Vegetarian",
        calories: 280,
        plans: ["muscle-building", "weight-gain"],
      },
      {
        name: "Vegetable Pulao",
        description:
          "Fragrant rice cooked with vegetables and whole spices. Balanced meal for weight maintenance.",
        emoji: "🍚",
        diet: "veg",
        dietLabel: "Vegetarian",
        calories: 380,
        plans: ["weight-gain", "muscle-building"],
      },
      {
        name: "Green Salad Bowl",
        description:
          "Fresh mixed greens with vegetables, nuts, and light dressing. Perfect for weight loss.",
        emoji: "🥬",
        diet: "veg",
        dietLabel: "Vegetarian",
        calories: 150,
        plans: ["weight-loss", "fat-loss"],
      },
    ],
    "non-veg": [
      {
        name: "Grilled Chicken Breast",
        description:
          "Tender chicken breast marinated in herbs and spices, grilled to perfection. High in protein, low in fat.",
        emoji: "🍗",
        diet: "non-veg",
        dietLabel: "Non-Vegetarian",
        calories: 250,
        plans: ["weight-loss", "fat-loss", "muscle-building"],
      },
      {
        name: "Prawn Stir Fry",
        description:
          "Fresh prawns stir-fried with vegetables, garlic, and ginger in a light sauce. Low calorie, high protein.",
        emoji: "🦐",
        diet: "non-veg",
        dietLabel: "Non-Vegetarian",
        calories: 200,
        plans: ["weight-loss", "fat-loss"],
      },
      {
        name: "Fish Curry",
        description:
          "Fresh fish cooked in a spicy coconut-based curry with aromatic spices. Omega-3 rich, good for fat loss.",
        emoji: "🐟",
        diet: "non-veg",
        dietLabel: "Non-Vegetarian",
        calories: 320,
        plans: ["fat-loss", "muscle-building"],
      },
      {
        name: "Mutton Biryani",
        description:
          "Fragrant basmati rice layered with tender mutton, spices, and fried onions. High calorie for weight gain.",
        emoji: "🍛",
        diet: "non-veg",
        dietLabel: "Non-Vegetarian",
        calories: 550,
        plans: ["weight-gain", "muscle-building"],
      },
      {
        name: "Chicken Tikka Masala",
        description:
          "Tender chicken pieces in a creamy tomato-based curry with aromatic spices. Protein-rich meal.",
        emoji: "🍗",
        diet: "non-veg",
        dietLabel: "Non-Vegetarian",
        calories: 420,
        plans: ["muscle-building", "weight-gain"],
      },
      {
        name: "Egg Curry",
        description:
          "Hard-boiled eggs in a spicy onion-tomato gravy, rich in protein. Perfect for muscle building.",
        emoji: "🥚",
        diet: "non-veg",
        dietLabel: "Non-Vegetarian",
        calories: 280,
        plans: ["muscle-building", "weight-gain", "fat-loss"],
      },
      {
        name: "Grilled Salmon",
        description:
          "Omega-3 rich salmon grilled with herbs. Excellent for fat loss and muscle building.",
        emoji: "🐟",
        diet: "non-veg",
        dietLabel: "Non-Vegetarian",
        calories: 300,
        plans: ["fat-loss", "muscle-building"],
      },
    ],
    vegan: [
      {
        name: "Chickpea Salad",
        description:
          "Fresh chickpeas mixed with vegetables, herbs, and a lemon-olive oil dressing. Low calorie, high fiber.",
        emoji: "🥙",
        diet: "vegan",
        dietLabel: "Vegan",
        calories: 220,
        plans: ["weight-loss", "fat-loss"],
      },
      {
        name: "Lentil Curry",
        description:
          "Protein-rich red lentils cooked with tomatoes, onions, and aromatic spices. Great for muscle building.",
        emoji: "🍲",
        diet: "vegan",
        dietLabel: "Vegan",
        calories: 250,
        plans: ["muscle-building", "weight-gain", "fat-loss"],
      },
      {
        name: "Quinoa Buddha Bowl",
        description:
          "Nutritious quinoa topped with roasted vegetables, chickpeas, and tahini dressing. Complete protein source.",
        emoji: "🥗",
        diet: "vegan",
        dietLabel: "Vegan",
        calories: 380,
        plans: ["muscle-building", "weight-gain"],
      },
      {
        name: "Vegan Pad Thai",
        description:
          "Rice noodles stir-fried with tofu, vegetables, and a tangy tamarind sauce. High calorie for weight gain.",
        emoji: "🍜",
        diet: "vegan",
        dietLabel: "Vegan",
        calories: 420,
        plans: ["weight-gain", "muscle-building"],
      },
      {
        name: "Tofu Scramble",
        description:
          "Scrambled tofu with vegetables, turmeric, and spices - a protein-packed breakfast.",
        emoji: "🍳",
        diet: "vegan",
        dietLabel: "Vegan",
        calories: 200,
        plans: ["weight-loss", "fat-loss", "muscle-building"],
      },
      {
        name: "Vegan Pasta",
        description:
          "Whole wheat pasta with marinara sauce, vegetables, and nutritional yeast. Good for weight gain.",
        emoji: "🍝",
        diet: "vegan",
        dietLabel: "Vegan",
        calories: 350,
        plans: ["weight-gain", "muscle-building"],
      },
      {
        name: "Green Smoothie Bowl",
        description:
          "Nutrient-dense smoothie bowl with fruits, greens, and plant-based protein. Low calorie option.",
        emoji: "🥤",
        diet: "vegan",
        dietLabel: "Vegan",
        calories: 180,
        plans: ["weight-loss", "fat-loss"],
      },
    ],
  };

  // Get base meals for diet type
  const baseMeals = allMeals[diet] || [];

  // Filter meals based on plan
  return baseMeals
    .filter((meal) => {
      // Each meal has a plans array indicating which plans it's suitable for
      return meal.plans && meal.plans.includes(plan);
    })
    .map((meal) => {
      return {
        ...meal,
        calories: meal.calories.toString(),
        planLabel: getPlanLabel(plan),
      };
    });
}

// Get plan label
function getPlanLabel(plan) {
  const labels = {
    "weight-loss": "Weight Loss",
    "weight-gain": "Weight Gain",
    "fat-loss": "Fat Loss",
    "muscle-building": "Muscle Building",
  };
  return labels[plan] || plan;
}

// Load exercises based on plan
function loadExercises() {
  const users = getUsers();
  const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
  const user = users.find((u) => u.email === currentUserEmail);

  const exercisesContainer = document.getElementById("exercises-container");

  if (!user || !user.profile || !user.profile.plan) {
    exercisesContainer.innerHTML = `
            <div class="empty-state">
                <h3>Select Your Fitness Plan</h3>
                <p>Please select a fitness plan in your profile to get personalized exercise recommendations.</p>
            </div>
        `;
    return;
  }

  const plan = user.profile.plan;
  const exercises = getExercisesByPlan(plan);

  if (exercises.length === 0) {
    exercisesContainer.innerHTML = `
            <div class="empty-state">
                <h3>No Exercises Available</h3>
                <p>We're working on adding more exercise recommendations for your plan.</p>
            </div>
        `;
    return;
  }

  exercisesContainer.innerHTML = exercises
    .map(
      (exercise) => `
        <div class="exercise-card">
            <div class="exercise-header">
                <div class="exercise-icon">${exercise.emoji}</div>
                <div class="exercise-title">${exercise.name}</div>
            </div>
            <div class="exercise-content">
                <p class="exercise-description">${exercise.description}</p>
                <div class="exercise-details">
                    <div class="exercise-detail">
                        <strong>Sets:</strong>
                        <span>${exercise.sets}</span>
                    </div>
                    <div class="exercise-detail">
                        <strong>Reps:</strong>
                        <span>${exercise.reps}</span>
                    </div>
                    <div class="exercise-detail">
                        <strong>Duration:</strong>
                        <span>${exercise.duration}</span>
                    </div>
                    <div class="exercise-detail">
                        <strong>Frequency:</strong>
                        <span>${exercise.frequency}</span>
                    </div>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// Get exercises by plan
function getExercisesByPlan(plan) {
  const allExercises = {
    "weight-loss": [
      {
        name: "Cardio Running",
        description:
          "Moderate to high-intensity running helps burn calories and improve cardiovascular health. Start with 20-30 minutes.",
        emoji: "🏃",
        sets: "N/A",
        reps: "N/A",
        duration: "20-45 minutes",
        frequency: "4-5 times/week",
      },
      {
        name: "HIIT Workout",
        description:
          "High-Intensity Interval Training alternates between intense bursts and recovery periods. Very effective for weight loss.",
        emoji: "⚡",
        sets: "4-6 rounds",
        reps: "30-60 sec intervals",
        duration: "20-30 minutes",
        frequency: "3-4 times/week",
      },
      {
        name: "Cycling",
        description:
          "Low-impact cardio exercise that burns calories while being gentle on joints. Great for beginners.",
        emoji: "🚴",
        sets: "N/A",
        reps: "N/A",
        duration: "30-60 minutes",
        frequency: "4-5 times/week",
      },
      {
        name: "Jump Rope",
        description:
          "Simple yet effective cardio exercise that burns calories quickly. Can be done anywhere.",
        emoji: "🦘",
        sets: "5-10 sets",
        reps: "30-60 seconds",
        duration: "15-20 minutes",
        frequency: "5-6 times/week",
      },
      {
        name: "Swimming",
        description:
          "Full-body workout that burns calories while being easy on joints. Excellent for weight loss.",
        emoji: "🏊",
        sets: "N/A",
        reps: "N/A",
        duration: "30-45 minutes",
        frequency: "3-4 times/week",
      },
      {
        name: "Bodyweight Circuit",
        description:
          "Combination of push-ups, squats, lunges, and planks. No equipment needed, burns calories effectively.",
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
        description:
          "Squats, deadlifts, and bench presses work multiple muscle groups. Essential for building mass.",
        emoji: "🏋️",
        sets: "4-5 sets",
        reps: "6-10 reps",
        duration: "45-60 minutes",
        frequency: "3-4 times/week",
      },
      {
        name: "Progressive Overload",
        description:
          "Gradually increase weight or reps over time. Key principle for muscle and weight gain.",
        emoji: "📈",
        sets: "3-5 sets",
        reps: "8-12 reps",
        duration: "60 minutes",
        frequency: "4-5 times/week",
      },
      {
        name: "Isolation Exercises",
        description:
          "Target specific muscle groups with bicep curls, tricep extensions, and leg curls.",
        emoji: "🎯",
        sets: "3-4 sets",
        reps: "10-15 reps",
        duration: "30-45 minutes",
        frequency: "4-5 times/week",
      },
      {
        name: "Resistance Training",
        description:
          "Use weights, resistance bands, or bodyweight to build muscle mass and strength.",
        emoji: "🏋️‍♀️",
        sets: "3-5 sets",
        reps: "8-12 reps",
        duration: "45-60 minutes",
        frequency: "4-5 times/week",
      },
      {
        name: "Full Body Workout",
        description:
          "Work all major muscle groups in one session. Great for overall muscle development.",
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
        description:
          "Build muscle to increase metabolism. More muscle means more calories burned at rest.",
        emoji: "💪",
        sets: "3-4 sets",
        reps: "8-12 reps",
        duration: "45 minutes",
        frequency: "3-4 times/week",
      },
      {
        name: "Circuit Training",
        description:
          "Combine strength and cardio exercises in quick succession. Burns fat while building muscle.",
        emoji: "🔄",
        sets: "3-5 rounds",
        reps: "10-15 each",
        duration: "30-40 minutes",
        frequency: "4-5 times/week",
      },
      {
        name: "Rowing",
        description:
          "Full-body cardio exercise that builds strength while burning calories. Excellent for fat loss.",
        emoji: "🚣",
        sets: "N/A",
        reps: "N/A",
        duration: "20-30 minutes",
        frequency: "4-5 times/week",
      },
      {
        name: "Stair Climbing",
        description:
          "High-intensity exercise that targets legs and glutes while burning significant calories.",
        emoji: "📶",
        sets: "5-10 sets",
        reps: "2-3 minutes",
        duration: "20-30 minutes",
        frequency: "4-5 times/week",
      },
      {
        name: "Kettlebell Swings",
        description:
          "Explosive full-body movement that builds power and burns fat effectively.",
        emoji: "⚖️",
        sets: "4-5 sets",
        reps: "15-20 reps",
        duration: "20-30 minutes",
        frequency: "3-4 times/week",
      },
      {
        name: "Yoga Flow",
        description:
          "Dynamic yoga sequences that build strength, flexibility, and burn calories.",
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
        description:
          "Focus on compound movements with heavy weights. Squats, deadlifts, bench press, and rows.",
        emoji: "🏋️",
        sets: "4-6 sets",
        reps: "4-8 reps",
        duration: "60-90 minutes",
        frequency: "4-5 times/week",
      },
      {
        name: "Progressive Overload",
        description:
          "Systematically increase weight, reps, or sets over time. Essential for muscle growth.",
        emoji: "📈",
        sets: "3-5 sets",
        reps: "6-12 reps",
        duration: "60 minutes",
        frequency: "4-6 times/week",
      },
      {
        name: "Split Training",
        description:
          "Focus on different muscle groups each day. Allows for better recovery and growth.",
        emoji: "🎯",
        sets: "4-5 sets",
        reps: "8-12 reps",
        duration: "60 minutes",
        frequency: "5-6 times/week",
      },
      {
        name: "Isolation Exercises",
        description:
          "Target specific muscles with focused movements. Bicep curls, tricep extensions, leg curls.",
        emoji: "🎯",
        sets: "3-4 sets",
        reps: "10-15 reps",
        duration: "30-45 minutes",
        frequency: "5-6 times/week",
      },
      {
        name: "Pull-Ups & Dips",
        description:
          "Bodyweight exercises that build upper body strength. Excellent for muscle building.",
        emoji: "🤸",
        sets: "3-5 sets",
        reps: "8-12 reps",
        duration: "20-30 minutes",
        frequency: "3-4 times/week",
      },
      {
        name: "Leg Day Focus",
        description:
          "Dedicated leg training with squats, lunges, and leg presses. Builds lower body mass.",
        emoji: "🦵",
        sets: "4-5 sets",
        reps: "8-12 reps",
        duration: "60 minutes",
        frequency: "2 times/week",
      },
    ],
  };

  return allExercises[plan] || [];
}

// Switch page
function switchPage(page) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-btn")
    .forEach((btn) => btn.classList.remove("active"));

  document.getElementById(`${page}-page`).classList.add("active");
  const navBtn = document.querySelector(`[data-page="${page}"]`);
  if (navBtn) {
    navBtn.classList.add("active");
  }

  if (page === "meals") {
    loadMeals();
  } else if (page === "exercises") {
    loadExercises();
  } else if (page === "meal-planner") {
    loadMealPlanner();
  } else if (page === "consultation") {
    loadAppointments();
    setMinDate();
  }
}

// Show auth section
function showAuth() {
  document.getElementById("auth-section").classList.remove("hidden");
  document.getElementById("dashboard-section").classList.add("hidden");
}

// Show dashboard
function showDashboard() {
  document.getElementById("auth-section").classList.add("hidden");
  document.getElementById("dashboard-section").classList.remove("hidden");
}

// Handle logout
function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem(CURRENT_USER_KEY);
    showAuth();
    document.getElementById("loginForm").reset();
  }
}

// Get users from storage
function getUsers() {
  const users = localStorage.getItem(STORAGE_KEY);
  return users ? JSON.parse(users) : [];
}

// Save users to storage
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// Add BMI calculation on input change
document.addEventListener("DOMContentLoaded", () => {
  const heightInput = document.getElementById("profile-height");
  const weightInput = document.getElementById("profile-weight");

  if (heightInput && weightInput) {
    heightInput.addEventListener("input", updateBMI);
    weightInput.addEventListener("input", updateBMI);
  }
});

// Meal Planner Functions
const MEAL_PLANNER_KEY = "nutriverse_meal_planner";

function loadMealPlanner() {
  const users = getUsers();
  const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
  const user = users.find((u) => u.email === currentUserEmail);

  const plannerContainer = document.getElementById("meal-planner-container");

  if (!user || !user.profile || !user.profile.diet || !user.profile.plan) {
    plannerContainer.innerHTML = `
            <div class="empty-state">
                <h3>Complete Your Profile</h3>
                <p>Please complete your profile with diet type and fitness plan to generate a meal plan.</p>
            </div>
        `;
    return;
  }

  const mealPlan = getMealPlan(currentUserEmail);

  if (!mealPlan || Object.keys(mealPlan).length === 0) {
    plannerContainer.innerHTML = `
            <div class="empty-state">
                <h3>No Meal Plan Generated</h3>
                <p>Click "Generate Weekly Plan" to create your personalized weekly meal plan.</p>
            </div>
        `;
    return;
  }

  displayMealPlan(mealPlan);
}

function generateWeeklyMealPlan() {
  const users = getUsers();
  const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
  const user = users.find((u) => u.email === currentUserEmail);

  if (!user || !user.profile || !user.profile.diet || !user.profile.plan) {
    alert(
      "Please complete your profile with diet type and fitness plan first!"
    );
    return;
  }

  const diet = user.profile.diet;
  const plan = user.profile.plan;
  const availableMeals = getMealsByDietAndPlan(diet, plan);

  if (availableMeals.length === 0) {
    alert(
      "No meals available for your diet type and plan. Please check your profile settings."
    );
    return;
  }

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const mealTypes = ["Breakfast", "Lunch", "Dinner"];
  const weeklyPlan = {};

  days.forEach((day) => {
    weeklyPlan[day] = {
      Breakfast: null,
      Lunch: null,
      Dinner: null,
    };

    mealTypes.forEach((mealType) => {
      // Randomly select a meal from available meals
      const randomMeal =
        availableMeals[Math.floor(Math.random() * availableMeals.length)];
      weeklyPlan[day][mealType] = {
        name: randomMeal.name,
        calories: parseInt(randomMeal.calories),
        emoji: randomMeal.emoji,
      };
    });
  });

  saveMealPlan(currentUserEmail, weeklyPlan);
  displayMealPlan(weeklyPlan);
  alert("Weekly meal plan generated successfully!");
}

function displayMealPlan(mealPlan) {
  const plannerContainer = document.getElementById("meal-planner-container");
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  plannerContainer.innerHTML = days
    .map((day) => {
      const dayMeals = mealPlan[day];
      const totalCalories =
        (dayMeals.Breakfast?.calories || 0) +
        (dayMeals.Lunch?.calories || 0) +
        (dayMeals.Dinner?.calories || 0);

      return `
            <div class="day-card">
                <div class="day-header">${day}</div>
                <div class="meal-slot">
                    <div class="meal-slot-title">🌅 Breakfast</div>
                    ${
                      dayMeals.Breakfast
                        ? `
                        <div class="meal-item">
                            <span class="meal-item-name">${dayMeals.Breakfast.emoji} ${dayMeals.Breakfast.name}</span>
                            <span class="meal-item-calories">${dayMeals.Breakfast.calories} cal</span>
                        </div>
                    `
                        : '<div class="meal-item"><span class="meal-item-name">Not planned</span></div>'
                    }
                </div>
                <div class="meal-slot">
                    <div class="meal-slot-title">☀️ Lunch</div>
                    ${
                      dayMeals.Lunch
                        ? `
                        <div class="meal-item">
                            <span class="meal-item-name">${dayMeals.Lunch.emoji} ${dayMeals.Lunch.name}</span>
                            <span class="meal-item-calories">${dayMeals.Lunch.calories} cal</span>
                        </div>
                    `
                        : '<div class="meal-item"><span class="meal-item-name">Not planned</span></div>'
                    }
                </div>
                <div class="meal-slot">
                    <div class="meal-slot-title">🌙 Dinner</div>
                    ${
                      dayMeals.Dinner
                        ? `
                        <div class="meal-item">
                            <span class="meal-item-name">${dayMeals.Dinner.emoji} ${dayMeals.Dinner.name}</span>
                            <span class="meal-item-calories">${dayMeals.Dinner.calories} cal</span>
                        </div>
                    `
                        : '<div class="meal-item"><span class="meal-item-name">Not planned</span></div>'
                    }
                </div>
                <div class="day-total">
                    <span>Total Calories:</span>
                    <span>${totalCalories} cal</span>
                </div>
            </div>
        `;
    })
    .join("");
}

function clearMealPlan() {
  if (confirm("Are you sure you want to clear your meal plan?")) {
    const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
    saveMealPlan(currentUserEmail, {});
    loadMealPlanner();
  }
}

function getMealPlan(email) {
  const plannerData = localStorage.getItem(MEAL_PLANNER_KEY);
  if (!plannerData) return {};
  const plans = JSON.parse(plannerData);
  return plans[email] || {};
}

function saveMealPlan(email, plan) {
  const plannerData = localStorage.getItem(MEAL_PLANNER_KEY);
  const plans = plannerData ? JSON.parse(plannerData) : {};
  plans[email] = plan;
  localStorage.setItem(MEAL_PLANNER_KEY, JSON.stringify(plans));
}

// Consultation Functions
const APPOINTMENTS_KEY = "nutriverse_appointments";

function setMinDate() {
  const dateInput = document.getElementById("consultation-date");
  if (dateInput) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split("T")[0];
  }
}

function handleConsultationBooking(e) {
  e.preventDefault();

  const date = document.getElementById("consultation-date").value;
  const time = document.getElementById("consultation-time").value;
  const doctor = document.getElementById("consultation-doctor").value;
  const reason = document.getElementById("consultation-reason").value;

  const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);

  const appointment = {
    id: Date.now(),
    email: currentUserEmail,
    date,
    time,
    doctor,
    reason,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const appointments = getAppointments();
  appointments.push(appointment);
  saveAppointments(appointments);

  document.getElementById("consultationForm").reset();
  loadAppointments();
  alert(
    "Appointment booked successfully! You will receive a confirmation email shortly."
  );
}

function loadAppointments() {
  const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
  const appointments = getAppointments().filter(
    (apt) => apt.email === currentUserEmail
  );

  const appointmentsList = document.getElementById("appointments-list");

  if (appointments.length === 0) {
    appointmentsList.innerHTML = `
            <div class="empty-state">
                <h3>No Appointments</h3>
                <p>You haven't booked any appointments yet. Book your first consultation above!</p>
            </div>
        `;
    return;
  }

  // Sort appointments by date
  appointments.sort((a, b) => new Date(a.date) - new Date(b.date));

  const doctorNames = {
    "dr-smith": "Dr. Sarah Smith - Nutritionist",
    "dr-johnson": "Dr. Michael Johnson - Dietitian",
    "dr-williams": "Dr. Emily Williams - Wellness Coach",
    "dr-brown": "Dr. David Brown - Clinical Nutritionist",
  };

  appointmentsList.innerHTML = appointments
    .map((apt) => {
      const appointmentDate = new Date(apt.date);
      const formattedDate = appointmentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const time12hr = formatTime12Hour(apt.time);

      return `
            <div class="appointment-item">
                <div class="appointment-header">
                    <div>
                        <div class="appointment-doctor">${
                          doctorNames[apt.doctor] || apt.doctor
                        }</div>
                        <div class="appointment-date-time">📅 ${formattedDate} at ${time12hr}</div>
                    </div>
                </div>
                <div class="appointment-reason">${apt.reason}</div>
                <span class="appointment-status ${apt.status}">${
        apt.status.charAt(0).toUpperCase() + apt.status.slice(1)
      }</span>
                <button class="delete-appointment" onclick="deleteAppointment(${
                  apt.id
                })">Cancel Appointment</button>
            </div>
        `;
    })
    .join("");
}

function formatTime12Hour(time24) {
  const [hours, minutes] = time24.split(":");
  const hour12 = parseInt(hours) % 12 || 12;
  const ampm = parseInt(hours) >= 12 ? "PM" : "AM";
  return `${hour12}:${minutes} ${ampm}`;
}

function deleteAppointment(id) {
  if (confirm("Are you sure you want to cancel this appointment?")) {
    const appointments = getAppointments();
    const filtered = appointments.filter((apt) => apt.id !== id);
    saveAppointments(filtered);
    loadAppointments();
  }
}

// Make deleteAppointment available globally
window.deleteAppointment = deleteAppointment;

function getAppointments() {
  const appointments = localStorage.getItem(APPOINTMENTS_KEY);
  return appointments ? JSON.parse(appointments) : [];
}

function saveAppointments(appointments) {
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
}
