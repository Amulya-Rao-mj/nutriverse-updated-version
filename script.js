// API Configuration
const API_BASE_URL = "http://127.0.0.1:5000/api";
const TOKEN_KEY = "nutriverse_token";

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  setupEventListeners();

  // Add BMI listeners
  const heightInput = document.getElementById("profile-height");
  const weightInput = document.getElementById("profile-weight");
  if (heightInput && weightInput) {
    heightInput.addEventListener("input", updateBMI);
    weightInput.addEventListener("input", updateBMI);
  }
});

// Helper for authenticated API requests
async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes("/auth/login")) {
        // Token expired or invalid
        localStorage.removeItem(TOKEN_KEY);
        showAuth();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    if (error.message !== "Session expired. Please login again.") {
      if (error.message.includes("Failed to fetch")) {
        alert(
          "Connection Error: Cannot reach the backend server.\n\n1. Make sure you ran 'npm start' in the backend folder.\n2. Ensure the backend is running on port 5000.",
        );
      }
      console.error("API Error:", error);
    }
    throw error;
  }
}

// Check if user is logged in
async function checkAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    showAuth();
    return;
  }

  try {
    // Verify token and get user info
    const data = await fetchWithAuth("/auth/me");
    const user = data.user;

    showDashboard();
    if (user.role === "doctor") {
      setupDoctorView();
    } else {
      document
        .querySelectorAll(".nav-btn[data-page]:not(.doctor-nav)")
        .forEach((btn) => (btn.style.display = "block"));
      document
        .querySelectorAll(".doctor-nav")
        .forEach((btn) => (btn.style.display = "none"));
      loadUserProfile();
    }
  } catch (error) {
    // Error handled in fetchWithAuth (redirects to auth if 401)
    if (!document.getElementById("auth-section").classList.contains("hidden")) {
      // Already on auth screen
    } else {
      showAuth();
    }
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

  const doctorProfileForm = document.getElementById("doctorProfileForm");
  if (doctorProfileForm) {
    doctorProfileForm.addEventListener("submit", handleDoctorProfileSave);
  }

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

  // Add Recipe
  const addRecipeForm = document.getElementById("addRecipeForm");
  if (addRecipeForm) {
    addRecipeForm.addEventListener("submit", handleAddRecipeSubmit);
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
async function handleLogin(e) {
  e.preventDefault();
  console.log("Login form submitted"); // Debug log

  // Visual feedback
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerText;
  submitBtn.innerText = "Logging in...";
  submitBtn.disabled = true;

  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const roleInput = document.getElementById("login-role");

  if (!emailInput || !passwordInput) {
    console.error("Login inputs not found");
    submitBtn.innerText = originalText;
    submitBtn.disabled = false;
    return;
  }

  const email = emailInput.value;
  const password = passwordInput.value;
  const role = roleInput ? roleInput.value : "user";

  try {
    const data = await fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    });

    localStorage.setItem(TOKEN_KEY, data.token);
    document.getElementById("loginForm").reset();

    // Use user data directly from login response to avoid extra API call failure
    const user = data.user;
    showDashboard();

    if (user.role === "doctor") {
      setupDoctorView();
    } else {
      document
        .querySelectorAll(".nav-btn[data-page]:not(.doctor-nav)")
        .forEach((btn) => (btn.style.display = "block"));
      document
        .querySelectorAll(".doctor-nav")
        .forEach((btn) => (btn.style.display = "none"));
      loadUserProfile();
      switchPage("profile");
    }
  } catch (error) {
    alert(error.message);
  } finally {
    submitBtn.innerText = originalText;
    submitBtn.disabled = false;
  }
}

// Handle signup
async function handleSignup(e) {
  e.preventDefault();
  console.log("Signup form submitted"); // Debug log

  const nameInput = document.getElementById("signup-name");
  const emailInput = document.getElementById("signup-email");
  const roleInput = document.getElementById("signup-role");
  const passwordInput = document.getElementById("signup-password");

  const name = nameInput ? nameInput.value : "";
  const email = emailInput ? emailInput.value : "";
  const role = roleInput ? roleInput.value : "user";
  const password = passwordInput ? passwordInput.value : "";

  try {
    const data = await fetchWithAuth("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });

    localStorage.setItem(TOKEN_KEY, data.token);
    document.getElementById("signupForm").reset();

    showDashboard();
    if (role === "doctor") {
      setupDoctorView();
    } else {
      document
        .querySelectorAll(".nav-btn[data-page]:not(.doctor-nav)")
        .forEach((btn) => (btn.style.display = "block"));
      document
        .querySelectorAll(".doctor-nav")
        .forEach((btn) => (btn.style.display = "none"));
      switchPage("profile");
      // New users have empty profiles, so nothing to load yet
    }
  } catch (error) {
    alert(error.message);
  }
}

// Handle profile save
async function handleProfileSave(e) {
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

  try {
    await fetchWithAuth("/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    });

    updateBMI();
    alert("Profile saved successfully!");
    // Refresh data if needed
  } catch (error) {
    alert("Failed to save profile: " + error.message);
  }
}

// Load user profile
async function loadUserProfile() {
  try {
    const user = await fetchWithAuth("/profile");
    const profile = user.profile || {};

    document.getElementById("profile-name").value = profile.name || "";
    document.getElementById("profile-age").value = profile.age || "";
    document.getElementById("profile-gender").value = profile.gender || "";
    document.getElementById("profile-diet").value = profile.diet || "";
    document.getElementById("profile-height").value = profile.height || "";
    document.getElementById("profile-weight").value = profile.weight || "";
    document.getElementById("profile-plan").value = profile.plan || "";

    updateBMI();
  } catch (error) {
    console.error("Error loading profile:", error);
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
async function loadMeals() {
  const mealsContainer = document.getElementById("meals-container");
  mealsContainer.innerHTML = '<div class="loading">Loading meals...</div>';
  loadCommunityMeals();

  try {
    const data = await fetchWithAuth("/meals");

    if (data.message) {
      mealsContainer.innerHTML = `<div class="empty-state"><h3>Notice</h3><p>${data.message}</p></div>`;
      return;
    }
    const meals = data.meals || [];

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
    `,
      )
      .join("");
  } catch (error) {
    mealsContainer.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${error.message}</p></div>`;
  }
}

// Load community recipes
async function loadCommunityMeals() {
  const container = document.getElementById("community-meals-container");
  if (!container) return;

  container.innerHTML =
    '<div class="loading">Loading community recipes...</div>';

  try {
    const data = await fetchWithAuth("/meals/community");
    const recipes = data.recipes || [];

    if (recipes.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><p>No community recipes yet. Be the first to add one!</p></div>';
      return;
    }

    container.innerHTML = recipes
      .map(
        (recipe) => `
      <div class="meal-card">
        <div class="meal-image">${recipe.emoji || "🍲"}</div>
        <div class="meal-content">
          <h3 class="meal-title">${recipe.name}</h3>
          <p class="meal-description">${recipe.description}</p>
          <div class="meal-tags">
            <span class="meal-tag ${recipe.diet}">${
              recipe.diet === "non-veg"
                ? "Non-Veg"
                : recipe.diet === "veg"
                  ? "Veg"
                  : "Vegan"
            }</span>
            <span class="meal-tag">${recipe.calories} cal</span>
            <span class="meal-tag">By ${
              recipe.createdBy?.profile?.name || "User"
            }</span>
          </div>
        </div>
      </div>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading community meals:", error);
    container.innerHTML = `<div class="empty-state"><p>Error loading recipes: ${error.message}</p></div>`;
  }
}

// Add Recipe Modal Functions
function openAddRecipeModal() {
  document.getElementById("add-recipe-modal").classList.remove("hidden");
}

function closeAddRecipeModal() {
  document.getElementById("add-recipe-modal").classList.add("hidden");
}

async function handleAddRecipeSubmit(e) {
  e.preventDefault();

  const calories = parseInt(document.getElementById("recipe-calories").value);
  if (isNaN(calories)) {
    alert("Please enter a valid number for calories");
    return;
  }

  const recipe = {
    name: document.getElementById("recipe-name").value,
    description: document.getElementById("recipe-description").value,
    calories: calories,
    diet: document.getElementById("recipe-diet").value,
    ingredients: document.getElementById("recipe-ingredients").value,
    instructions: document.getElementById("recipe-instructions").value,
    emoji: "🍲", // Default emoji
  };

  try {
    await fetchWithAuth("/meals", {
      method: "POST",
      body: JSON.stringify(recipe),
    });

    closeAddRecipeModal();
    document.getElementById("addRecipeForm").reset();
    alert("Recipe added successfully!");
    loadCommunityMeals();
  } catch (error) {
    alert("Failed to add recipe: " + error.message);
  }
}

// Make global for onclick handlers
window.openAddRecipeModal = openAddRecipeModal;
window.closeAddRecipeModal = closeAddRecipeModal;

// Load exercises based on plan
async function loadExercises() {
  const exercisesContainer = document.getElementById("exercises-container");
  exercisesContainer.innerHTML =
    '<div class="loading">Loading exercises...</div>';

  try {
    const data = await fetchWithAuth("/exercises");

    if (data.message) {
      exercisesContainer.innerHTML = `<div class="empty-state"><h3>Notice</h3><p>${data.message}</p></div>`;
      return;
    }
    const exercises = data.exercises || [];

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
    `,
      )
      .join("");
  } catch (error) {
    exercisesContainer.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${error.message}</p></div>`;
  }
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
    populateDoctorDropdown();
  } else if (page === "doctor") {
    loadDoctorAppointments();
  } else if (page === "doctor-profile") {
    loadDoctorProfile();
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
    localStorage.removeItem(TOKEN_KEY);
    showAuth();
    document.getElementById("loginForm").reset();
  }
}

// Meal Planner Functions
async function loadMealPlanner() {
  const plannerContainer = document.getElementById("meal-planner-container");
  plannerContainer.innerHTML =
    '<div class="loading">Loading meal plan...</div>';

  try {
    const data = await fetchWithAuth("/meal-planner");
    const mealPlan = data.weeklyPlan || {};

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
  } catch (error) {
    plannerContainer.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${error.message}</p></div>`;
  }
}

async function generateWeeklyMealPlan() {
  try {
    const data = await fetchWithAuth("/meal-planner/generate", {
      method: "POST",
    });
    displayMealPlan(data.weeklyPlan);
    alert("Weekly meal plan generated successfully!");
  } catch (error) {
    alert("Failed to generate plan: " + error.message);
  }
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
      const dayMeals = mealPlan[day] || {};
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

async function clearMealPlan() {
  if (confirm("Are you sure you want to clear your meal plan?")) {
    try {
      await fetchWithAuth("/meal-planner", { method: "DELETE" });
      loadMealPlanner();
    } catch (error) {
      alert("Failed to clear plan: " + error.message);
    }
  }
}

// Consultation Functions
function setMinDate() {
  const dateInput = document.getElementById("consultation-date");
  if (dateInput) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split("T")[0];
  }
}

async function fetchDoctors() {
  try {
    const data = await fetchWithAuth("/auth/doctors");
    console.log("Fetched doctors:", data);
    if (Array.isArray(data)) return data;
    if (data.doctors && Array.isArray(data.doctors)) return data.doctors;
    return [];
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }
}

async function populateDoctorDropdown() {
  const select = document.getElementById("consultation-doctor");
  if (!select) return;

  const doctors = await fetchDoctors();
  select.innerHTML =
    '<option value="">Select Doctor</option>' +
    doctors
      .map((doc) => {
        const name = doc.profile?.name || "Unknown Doctor";
        const specialization = doc.profile?.specialization || "General";
        return `<option value="${doc._id}">Dr. ${name} (${specialization})</option>`;
      })
      .join("");
}

async function handleConsultationBooking(e) {
  e.preventDefault();

  const date = document.getElementById("consultation-date").value;
  const time = document.getElementById("consultation-time").value;
  const doctor = document.getElementById("consultation-doctor").value;
  const reason = document.getElementById("consultation-reason").value;

  try {
    await fetchWithAuth("/appointments", {
      method: "POST",
      body: JSON.stringify({ date, time, doctor, reason }),
    });

    document.getElementById("consultationForm").reset();
    loadAppointments();
    alert("Appointment booked successfully!");
  } catch (error) {
    alert("Failed to book appointment: " + error.message);
  }
}

async function loadAppointments() {
  const appointmentsList = document.getElementById("appointments-list");
  appointmentsList.innerHTML =
    '<div class="loading">Loading appointments...</div>';

  try {
    const data = await fetchWithAuth("/appointments");
    const appointments = data.appointments || [];

    // Fetch doctors to resolve names
    const doctors = await fetchDoctors();
    const doctorMap = doctors.reduce((acc, doc) => {
      const name = doc.profile?.name || "Unknown Doctor";
      acc[doc._id] = `Dr. ${name}`;
      return acc;
    }, {});

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
                          doctorMap[apt.doctor] || "Unknown Doctor"
                        }</div>
                        <div class="appointment-date-time">📅 ${formattedDate} at ${time12hr}</div>
                    </div>
                </div>
                <div class="appointment-reason">${apt.reason}</div>
                <span class="appointment-status ${apt.status}">${
                  apt.status.charAt(0).toUpperCase() + apt.status.slice(1)
                }</span>
                <button class="delete-appointment" onclick="deleteAppointment('${
                  apt._id
                }')">Cancel Appointment</button>
            </div>
        `;
      })
      .join("");
  } catch (error) {
    appointmentsList.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${error.message}</p></div>`;
  }
}

function formatTime12Hour(time24) {
  const [hours, minutes] = time24.split(":");
  const hour12 = parseInt(hours) % 12 || 12;
  const ampm = parseInt(hours) >= 12 ? "PM" : "AM";
  return `${hour12}:${minutes} ${ampm}`;
}

async function deleteAppointment(id) {
  if (confirm("Are you sure you want to cancel this appointment?")) {
    try {
      await fetchWithAuth(`/appointments/${id}`, { method: "DELETE" });
      loadAppointments();
    } catch (error) {
      alert("Failed to cancel appointment: " + error.message);
    }
  }
}

// Make deleteAppointment available globally
window.deleteAppointment = deleteAppointment;

// Doctor View Functions
function setupDoctorView() {
  // Hide user nav items
  document
    .querySelectorAll(".nav-btn[data-page]:not(.doctor-nav)")
    .forEach((btn) => {
      btn.style.display = "none";
    });

  // Show doctor nav items
  document.querySelectorAll(".doctor-nav").forEach((btn) => {
    btn.style.display = "block";
  });

  // Show doctor page
  switchPage("doctor");
}

async function loadDoctorAppointments() {
  const listContainer = document.getElementById("doctor-appointments-list");
  listContainer.innerHTML = '<div class="loading">Loading requests...</div>';

  try {
    const data = await fetchWithAuth("/appointments/all");
    const appointments = data.appointments || [];

    if (appointments.length === 0) {
      listContainer.innerHTML =
        '<div class="empty-state"><h3>No Appointments</h3><p>No appointment requests found.</p></div>';
      return;
    }

    // Sort by date
    appointments.sort((a, b) => new Date(a.date) - new Date(b.date));

    listContainer.innerHTML = appointments
      .map((apt) => {
        const date = new Date(apt.date).toLocaleDateString();
        const time = formatTime12Hour(apt.time);

        return `
      <div class="appointment-item">
        <div class="appointment-header">
          <div>
            <div class="appointment-doctor">Patient: ${
              apt.user?.profile?.name || "Unknown"
            } (${apt.user?.email || "No Email"})</div>
            <div class="appointment-date-time">📅 ${date} at ${time}</div>
          </div>
        </div>
        <div class="appointment-reason"><strong>Reason:</strong> ${
          apt.reason || "No reason provided"
        }</div>
        <div class="appointment-status ${
          apt.status
        }">Status: ${apt.status.toUpperCase()}</div>
        ${
          apt.status === "pending"
            ? `
          <div class="appointment-actions" style="margin-top: 10px;">
            <button class="btn btn-primary" onclick="updateAppointmentStatus('${apt._id}', 'confirmed')" style="padding: 5px 10px; font-size: 0.9rem;">Accept</button>
            <button class="btn btn-secondary" onclick="updateAppointmentStatus('${apt._id}', 'rejected')" style="padding: 5px 10px; font-size: 0.9rem; background: #f44336; color: white; border: none;">Reject</button>
          </div>
        `
            : ""
        }
      </div>
    `;
      })
      .join("");
  } catch (error) {
    listContainer.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${error.message}</p></div>`;
  }
}

async function updateAppointmentStatus(id, status) {
  try {
    await fetchWithAuth(`/appointments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    loadDoctorAppointments();
    alert(`Appointment ${status}!`);
  } catch (error) {
    alert("Failed to update status: " + error.message);
  }
}

async function loadDoctorProfile() {
  try {
    const user = await fetchWithAuth("/profile");
    const profile = user.profile || {};

    document.getElementById("doctor-profile-name").value = profile.name || "";
    document.getElementById("doctor-profile-specialization").value =
      profile.specialization || "";

    // Populate availability checklist
    const container = document.getElementById("doctor-availability-container");
    if (container) {
      const slots = [
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
      ];
      const savedSlots = profile.availableSlots || [];

      container.innerHTML = `
        <label style="display: block; margin-bottom: 10px; font-weight: 500;">Available Timings</label>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px;">
          ${slots
            .map(
              (time) => `
            <div style="display: flex; align-items: center; gap: 5px;">
              <input type="checkbox" id="slot-${time}" value="${time}" ${
                savedSlots.includes(time) ? "checked" : ""
              }>
              <label for="slot-${time}" style="margin: 0; font-size: 0.9rem;">${formatTime12Hour(
                time,
              )}</label>
            </div>
          `,
            )
            .join("")}
        </div>
      `;
    }
  } catch (error) {
    console.error("Error loading doctor profile:", error);
  }
}

async function handleDoctorProfileSave(e) {
  e.preventDefault();

  const selectedSlots = [];
  const container = document.getElementById("doctor-availability-container");
  if (container) {
    container
      .querySelectorAll('input[type="checkbox"]:checked')
      .forEach((cb) => {
        selectedSlots.push(cb.value);
      });
  }

  const profile = {
    name: document.getElementById("doctor-profile-name").value,
    specialization: document.getElementById("doctor-profile-specialization")
      .value,
    availableSlots: selectedSlots,
  };

  try {
    await fetchWithAuth("/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    });
    alert("Doctor profile saved successfully!");
  } catch (error) {
    alert("Failed to save profile: " + error.message);
  }
}

// Make global
window.updateAppointmentStatus = updateAppointmentStatus;
