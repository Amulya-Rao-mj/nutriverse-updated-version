// User data storage (using localStorage)
const STORAGE_KEY = 'nutriverse_users';
const CURRENT_USER_KEY = 'nutriverse_current_user';
const CURRENT_USER_ROLE_KEY = 'nutriverse_current_user_role';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check if user is logged in
function checkAuth() {
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    const currentRole = localStorage.getItem(CURRENT_USER_ROLE_KEY);
    if (currentUser && currentRole) {
        showDashboard(currentRole);
        if (currentRole === 'doctor') {
            loadDoctorProfile();
            loadDoctorAppointments();
        } else if (currentRole === 'user') {
            loadUserProfile();
        }
    } else {
        showAuth();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Auth form switching
    document.getElementById('show-signup').addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthForm('signup');
    });
    
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthForm('login');
    });
    
    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    document.getElementById('profileForm').addEventListener('submit', handleProfileSave);
    
    // Doctor profile form
    const doctorProfileForm = document.getElementById('doctorProfileForm');
    if (doctorProfileForm) {
        doctorProfileForm.addEventListener('submit', handleDoctorProfileSave);
    }
    
    // Navigation
    document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = e.target.getAttribute('data-page');
            switchPage(page);
        });
    });
    
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Meal planner
    const generateBtn = document.getElementById('generate-meal-plan');
    const clearBtn = document.getElementById('clear-meal-plan');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateWeeklyMealPlan);
    }
    if (clearBtn) {
        clearBtn.addEventListener('click', clearMealPlan);
    }
    
    // Consultation
    const consultationForm = document.getElementById('consultationForm');
    if (consultationForm) {
        consultationForm.addEventListener('submit', handleConsultationBooking);
    }
    
    // Recipe Modal
    const modal = document.getElementById('recipe-modal');
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
}

// Switch between login and signup forms
function switchAuthForm(form) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (form === 'signup') {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    } else {
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
    }
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const role = document.getElementById('login-role').value;
    
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password && u.role === role);
    
    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, email);
        localStorage.setItem(CURRENT_USER_ROLE_KEY, role);
        showDashboard(role);
        if (role === 'doctor') {
            loadDoctorProfile();
            loadDoctorAppointments();
        } else if (role === 'user') {
            loadUserProfile();
        }
        document.getElementById('loginForm').reset();
    } else {
        alert('Invalid email, password, or role!');
    }
}

// Handle signup
function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;
    
    const users = getUsers();
    
    if (users.find(u => u.email === email)) {
        alert('Email already registered!');
        return;
    }
    
    const newUser = {
        email,
        password,
        role,
        profile: role === 'doctor' ? {
            name,
            designation: '',
            availableTimings: []
        } : {
            name,
            age: '',
            gender: '',
            diet: '',
            height: '',
            weight: '',
            plan: '',
            allergies: []
        }
    };
    
    users.push(newUser);
    saveUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, email);
    localStorage.setItem(CURRENT_USER_ROLE_KEY, role);
    
    showDashboard(role);
    if (role === 'doctor') {
        loadDoctorProfile();
    } else if (role === 'user') {
        loadUserProfile();
    }
    document.getElementById('signupForm').reset();
}

// Handle profile save
function handleProfileSave(e) {
    e.preventDefault();
    const allergyCheckboxes = document.querySelectorAll('.allergy-checkbox:checked');
    const allergies = Array.from(allergyCheckboxes).map(cb => cb.value);
    
    const profile = {
        name: document.getElementById('profile-name').value,
        age: document.getElementById('profile-age').value,
        gender: document.getElementById('profile-gender').value,
        diet: document.getElementById('profile-diet').value,
        height: document.getElementById('profile-height').value,
        weight: document.getElementById('profile-weight').value,
        plan: document.getElementById('profile-plan').value,
        allergies: allergies
    };
    
    const users = getUsers();
    const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
    const userIndex = users.findIndex(u => u.email === currentUserEmail);
    
    if (userIndex !== -1) {
        users[userIndex].profile = profile;
        saveUsers(users);
        updateBMI();
        alert('Profile saved successfully!');
        loadMeals(); // Refresh meals when profile is updated
        loadExercises(); // Refresh exercises when profile is updated
    }
}

// Load user profile
function loadUserProfile() {
    const users = getUsers();
    const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
    const user = users.find(u => u.email === currentUserEmail);
    
    if (user && user.profile) {
        const profile = user.profile;
        document.getElementById('profile-name').value = profile.name || '';
        document.getElementById('profile-age').value = profile.age || '';
        document.getElementById('profile-gender').value = profile.gender || '';
        document.getElementById('profile-diet').value = profile.diet || '';
        document.getElementById('profile-height').value = profile.height || '';
        document.getElementById('profile-weight').value = profile.weight || '';
        document.getElementById('profile-plan').value = profile.plan || '';
        
        // Load allergies
        const allergies = profile.allergies || [];
        document.querySelectorAll('.allergy-checkbox').forEach(checkbox => {
            checkbox.checked = allergies.includes(checkbox.value);
        });
        
        updateBMI();
        loadMeals();
        loadExercises();
    }
}

// Update BMI display
function updateBMI() {
    const height = parseFloat(document.getElementById('profile-height').value);
    const weight = parseFloat(document.getElementById('profile-weight').value);
    const bmiDisplay = document.getElementById('bmi-display');
    
    if (height && weight && height > 0 && weight > 0) {
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        
        let category = '';
        let color = '';
        
        if (bmi < 18.5) {
            category = 'Underweight';
            color = '#2196F3';
        } else if (bmi < 25) {
            category = 'Normal';
            color = '#4CAF50';
        } else if (bmi < 30) {
            category = 'Overweight';
            color = '#FF9800';
        } else {
            category = 'Obese';
            color = '#F44336';
        }
        
        bmiDisplay.innerHTML = `
            <h3>Your BMI: ${bmi}</h3>
            <p>Category: ${category}</p>
        `;
        bmiDisplay.style.background = `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`;
    } else {
        bmiDisplay.innerHTML = '';
    }
}

// Load meals based on diet type and plan
function loadMeals() {
    const users = getUsers();
    const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
    const user = users.find(u => u.email === currentUserEmail);
    
    const mealsContainer = document.getElementById('meals-container');
    
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
    
    mealsContainer.innerHTML = meals.map(meal => `
        <div class="meal-card" onclick="showRecipeDetail('${meal.id || meal.name}')">
            <div class="meal-image">${meal.emoji}</div>
            <div class="meal-content">
                <h3 class="meal-title">${meal.name}</h3>
                <p class="meal-description">${meal.description}</p>
                <div class="meal-tags">
                    <span class="meal-tag ${meal.diet}">${meal.dietLabel}</span>
                    <span class="meal-tag">${meal.calories} cal</span>
                    <span class="meal-tag">${meal.planLabel}</span>
                </div>
                <div style="margin-top: 10px; color: var(--primary-color); font-size: 0.9em; font-weight: 500;">
                    👆 Click to view recipe
                </div>
            </div>
        </div>
    `).join('');
}

// Get meals by diet type and plan
function getMealsByDietAndPlan(diet, plan) {
    const allMeals = {
        'veg': [
            {
                name: 'Vegetable Stir Fry',
                description: 'Fresh seasonal vegetables stir-fried with garlic, ginger, and light soy sauce. Low calorie, high fiber.',
                emoji: '🥗',
                diet: 'veg',
                dietLabel: 'Vegetarian',
                calories: 180,
                plans: ['weight-loss', 'fat-loss'],
                allergens: ['soy']
            },
            {
                name: 'Chana Masala',
                description: 'Spiced chickpeas cooked in a tangy tomato-based gravy, rich in protein. Perfect for muscle building.',
                emoji: '🍲',
                diet: 'veg',
                dietLabel: 'Vegetarian',
                calories: 350,
                plans: ['muscle-building', 'weight-gain'],
                allergens: []
            },
            {
                name: 'Paneer Tikka',
                description: 'Marinated cottage cheese cubes grilled to perfection. High protein, moderate calories.',
                emoji: '🍢',
                diet: 'veg',
                dietLabel: 'Vegetarian',
                calories: 320,
                plans: ['muscle-building', 'weight-gain', 'fat-loss'],
                allergens: ['dairy']
            },
            {
                name: 'Vegetable Biryani',
                description: 'Aromatic basmati rice cooked with mixed vegetables, spices, and herbs. A complete meal packed with nutrients.',
                emoji: '🍛',
                diet: 'veg',
                dietLabel: 'Vegetarian',
                calories: 450,
                plans: ['weight-gain', 'muscle-building'],
                allergens: []
            },
            {
                name: 'Dal Makhani',
                description: 'Creamy black lentils cooked with butter and spices. High protein, good for muscle building.',
                emoji: '🥘',
                diet: 'veg',
                dietLabel: 'Vegetarian',
                calories: 280,
                plans: ['muscle-building', 'weight-gain'],
                allergens: ['dairy']
            },
            {
                name: 'Vegetable Pulao',
                description: 'Fragrant rice cooked with vegetables and whole spices. Balanced meal for weight maintenance.',
                emoji: '🍚',
                diet: 'veg',
                dietLabel: 'Vegetarian',
                calories: 380,
                plans: ['weight-gain', 'muscle-building'],
                allergens: []
            },
            {
                name: 'Green Salad Bowl',
                description: 'Fresh mixed greens with vegetables, nuts, and light dressing. Perfect for weight loss.',
                emoji: '🥬',
                diet: 'veg',
                dietLabel: 'Vegetarian',
                calories: 150,
                plans: ['weight-loss', 'fat-loss'],
                allergens: ['nuts']
            }
        ],
        'non-veg': [
            {
                name: 'Grilled Chicken Breast',
                description: 'Tender chicken breast marinated in herbs and spices, grilled to perfection. High in protein, low in fat.',
                emoji: '🍗',
                diet: 'non-veg',
                dietLabel: 'Non-Vegetarian',
                calories: 250,
                plans: ['weight-loss', 'fat-loss', 'muscle-building'],
                allergens: []
            },
            {
                name: 'Prawn Stir Fry',
                description: 'Fresh prawns stir-fried with vegetables, garlic, and ginger in a light sauce. Low calorie, high protein.',
                emoji: '🦐',
                diet: 'non-veg',
                dietLabel: 'Non-Vegetarian',
                calories: 200,
                plans: ['weight-loss', 'fat-loss'],
                allergens: ['seafood', 'soy']
            },
            {
                name: 'Fish Curry',
                description: 'Fresh fish cooked in a spicy coconut-based curry with aromatic spices. Omega-3 rich, good for fat loss.',
                emoji: '🐟',
                diet: 'non-veg',
                dietLabel: 'Non-Vegetarian',
                calories: 320,
                plans: ['fat-loss', 'muscle-building'],
                allergens: ['seafood']
            },
            {
                name: 'Mutton Biryani',
                description: 'Fragrant basmati rice layered with tender mutton, spices, and fried onions. High calorie for weight gain.',
                emoji: '🍛',
                diet: 'non-veg',
                dietLabel: 'Non-Vegetarian',
                calories: 550,
                plans: ['weight-gain', 'muscle-building'],
                allergens: ['dairy']
            },
            {
                name: 'Chicken Tikka Masala',
                description: 'Tender chicken pieces in a creamy tomato-based curry with aromatic spices. Protein-rich meal.',
                emoji: '🍗',
                diet: 'non-veg',
                dietLabel: 'Non-Vegetarian',
                calories: 420,
                plans: ['muscle-building', 'weight-gain'],
                allergens: ['dairy']
            },
            {
                name: 'Egg Curry',
                description: 'Hard-boiled eggs in a spicy onion-tomato gravy, rich in protein. Perfect for muscle building.',
                emoji: '🥚',
                diet: 'non-veg',
                dietLabel: 'Non-Vegetarian',
                calories: 280,
                plans: ['muscle-building', 'weight-gain', 'fat-loss'],
                allergens: ['eggs']
            },
            {
                name: 'Grilled Salmon',
                description: 'Omega-3 rich salmon grilled with herbs. Excellent for fat loss and muscle building.',
                emoji: '🐟',
                diet: 'non-veg',
                dietLabel: 'Non-Vegetarian',
                calories: 300,
                plans: ['fat-loss', 'muscle-building'],
                allergens: ['seafood']
            }
        ],
        'vegan': [
            {
                name: 'Chickpea Salad',
                description: 'Fresh chickpeas mixed with vegetables, herbs, and a lemon-olive oil dressing. Low calorie, high fiber.',
                emoji: '🥙',
                diet: 'vegan',
                dietLabel: 'Vegan',
                calories: 220,
                plans: ['weight-loss', 'fat-loss'],
                allergens: []
            },
            {
                name: 'Lentil Curry',
                description: 'Protein-rich red lentils cooked with tomatoes, onions, and aromatic spices. Great for muscle building.',
                emoji: '🍲',
                diet: 'vegan',
                dietLabel: 'Vegan',
                calories: 250,
                plans: ['muscle-building', 'weight-gain', 'fat-loss'],
                allergens: []
            },
            {
                name: 'Quinoa Buddha Bowl',
                description: 'Nutritious quinoa topped with roasted vegetables, chickpeas, and tahini dressing. Complete protein source.',
                emoji: '🥗',
                diet: 'vegan',
                dietLabel: 'Vegan',
                calories: 380,
                plans: ['muscle-building', 'weight-gain'],
                allergens: []
            },
            {
                name: 'Vegan Pad Thai',
                description: 'Rice noodles stir-fried with tofu, vegetables, and a tangy tamarind sauce. High calorie for weight gain.',
                emoji: '🍜',
                diet: 'vegan',
                dietLabel: 'Vegan',
                calories: 420,
                plans: ['weight-gain', 'muscle-building'],
                allergens: ['soy']
            },
            {
                name: 'Tofu Scramble',
                description: 'Scrambled tofu with vegetables, turmeric, and spices - a protein-packed breakfast.',
                emoji: '🍳',
                diet: 'vegan',
                dietLabel: 'Vegan',
                calories: 200,
                plans: ['weight-loss', 'fat-loss', 'muscle-building'],
                allergens: ['soy']
            },
            {
                name: 'Vegan Pasta',
                description: 'Whole wheat pasta with marinara sauce, vegetables, and nutritional yeast. Good for weight gain.',
                emoji: '🍝',
                diet: 'vegan',
                dietLabel: 'Vegan',
                calories: 350,
                plans: ['weight-gain', 'muscle-building'],
                allergens: ['gluten']
            },
            {
                name: 'Green Smoothie Bowl',
                description: 'Nutrient-dense smoothie bowl with fruits, greens, and plant-based protein. Low calorie option.',
                emoji: '🥤',
                diet: 'vegan',
                dietLabel: 'Vegan',
                calories: 180,
                plans: ['weight-loss', 'fat-loss'],
                allergens: ['nuts']
            }
        ]
    };
    
    // Get base meals for diet type
    const baseMeals = allMeals[diet] || [];
    
    // Get user allergies
    const users = getUsers();
    const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
    const user = users.find(u => u.email === currentUserEmail);
    const userAllergies = (user && user.profile && user.profile.allergies) || [];
    
    // Filter meals based on plan and allergies
    return baseMeals.filter(meal => {
        // Check if meal is suitable for the plan
        if (!meal.plans || !meal.plans.includes(plan)) {
            return false;
        }
        
        // Check if meal contains any allergens
        if (userAllergies.length > 0 && meal.allergens) {
            const hasAllergen = userAllergies.some(allergy => meal.allergens.includes(allergy));
            if (hasAllergen) {
                return false;
            }
        }
        
        return true;
    }).map(meal => {
        return {
            ...meal,
            calories: meal.calories.toString(),
            planLabel: getPlanLabel(plan)
        };
    });
}

// Get plan label
function getPlanLabel(plan) {
    const labels = {
        'weight-loss': 'Weight Loss',
        'weight-gain': 'Weight Gain',
        'fat-loss': 'Fat Loss',
        'muscle-building': 'Muscle Building'
    };
    return labels[plan] || plan;
}

// Load exercises based on plan
function loadExercises() {
    const users = getUsers();
    const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
    const user = users.find(u => u.email === currentUserEmail);
    
    const exercisesContainer = document.getElementById('exercises-container');
    
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
    
    exercisesContainer.innerHTML = exercises.map(exercise => `
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
    `).join('');
}

// Get exercises by plan
function getExercisesByPlan(plan) {
    const allExercises = {
        'weight-loss': [
            {
                name: 'Cardio Running',
                description: 'Moderate to high-intensity running helps burn calories and improve cardiovascular health. Start with 20-30 minutes.',
                emoji: '🏃',
                sets: 'N/A',
                reps: 'N/A',
                duration: '20-45 minutes',
                frequency: '4-5 times/week'
            },
            {
                name: 'HIIT Workout',
                description: 'High-Intensity Interval Training alternates between intense bursts and recovery periods. Very effective for weight loss.',
                emoji: '⚡',
                sets: '4-6 rounds',
                reps: '30-60 sec intervals',
                duration: '20-30 minutes',
                frequency: '3-4 times/week'
            },
            {
                name: 'Cycling',
                description: 'Low-impact cardio exercise that burns calories while being gentle on joints. Great for beginners.',
                emoji: '🚴',
                sets: 'N/A',
                reps: 'N/A',
                duration: '30-60 minutes',
                frequency: '4-5 times/week'
            },
            {
                name: 'Jump Rope',
                description: 'Simple yet effective cardio exercise that burns calories quickly. Can be done anywhere.',
                emoji: '🦘',
                sets: '5-10 sets',
                reps: '30-60 seconds',
                duration: '15-20 minutes',
                frequency: '5-6 times/week'
            },
            {
                name: 'Swimming',
                description: 'Full-body workout that burns calories while being easy on joints. Excellent for weight loss.',
                emoji: '🏊',
                sets: 'N/A',
                reps: 'N/A',
                duration: '30-45 minutes',
                frequency: '3-4 times/week'
            },
            {
                name: 'Bodyweight Circuit',
                description: 'Combination of push-ups, squats, lunges, and planks. No equipment needed, burns calories effectively.',
                emoji: '💪',
                sets: '3-4 rounds',
                reps: '10-15 each',
                duration: '20-30 minutes',
                frequency: '4-5 times/week'
            }
        ],
        'weight-gain': [
            {
                name: 'Compound Lifts',
                description: 'Squats, deadlifts, and bench presses work multiple muscle groups. Essential for building mass.',
                emoji: '🏋️',
                sets: '4-5 sets',
                reps: '6-10 reps',
                duration: '45-60 minutes',
                frequency: '3-4 times/week'
            },
            {
                name: 'Progressive Overload',
                description: 'Gradually increase weight or reps over time. Key principle for muscle and weight gain.',
                emoji: '📈',
                sets: '3-5 sets',
                reps: '8-12 reps',
                duration: '60 minutes',
                frequency: '4-5 times/week'
            },
            {
                name: 'Isolation Exercises',
                description: 'Target specific muscle groups with bicep curls, tricep extensions, and leg curls.',
                emoji: '🎯',
                sets: '3-4 sets',
                reps: '10-15 reps',
                duration: '30-45 minutes',
                frequency: '4-5 times/week'
            },
            {
                name: 'Resistance Training',
                description: 'Use weights, resistance bands, or bodyweight to build muscle mass and strength.',
                emoji: '🏋️‍♀️',
                sets: '3-5 sets',
                reps: '8-12 reps',
                duration: '45-60 minutes',
                frequency: '4-5 times/week'
            },
            {
                name: 'Full Body Workout',
                description: 'Work all major muscle groups in one session. Great for overall muscle development.',
                emoji: '🔥',
                sets: '3-4 sets',
                reps: '8-12 reps',
                duration: '60 minutes',
                frequency: '3-4 times/week'
            }
        ],
        'fat-loss': [
            {
                name: 'Strength Training',
                description: 'Build muscle to increase metabolism. More muscle means more calories burned at rest.',
                emoji: '💪',
                sets: '3-4 sets',
                reps: '8-12 reps',
                duration: '45 minutes',
                frequency: '3-4 times/week'
            },
            {
                name: 'Circuit Training',
                description: 'Combine strength and cardio exercises in quick succession. Burns fat while building muscle.',
                emoji: '🔄',
                sets: '3-5 rounds',
                reps: '10-15 each',
                duration: '30-40 minutes',
                frequency: '4-5 times/week'
            },
            {
                name: 'Rowing',
                description: 'Full-body cardio exercise that builds strength while burning calories. Excellent for fat loss.',
                emoji: '🚣',
                sets: 'N/A',
                reps: 'N/A',
                duration: '20-30 minutes',
                frequency: '4-5 times/week'
            },
            {
                name: 'Stair Climbing',
                description: 'High-intensity exercise that targets legs and glutes while burning significant calories.',
                emoji: '📶',
                sets: '5-10 sets',
                reps: '2-3 minutes',
                duration: '20-30 minutes',
                frequency: '4-5 times/week'
            },
            {
                name: 'Kettlebell Swings',
                description: 'Explosive full-body movement that builds power and burns fat effectively.',
                emoji: '⚖️',
                sets: '4-5 sets',
                reps: '15-20 reps',
                duration: '20-30 minutes',
                frequency: '3-4 times/week'
            },
            {
                name: 'Yoga Flow',
                description: 'Dynamic yoga sequences that build strength, flexibility, and burn calories.',
                emoji: '🧘',
                sets: 'N/A',
                reps: 'N/A',
                duration: '30-45 minutes',
                frequency: '4-5 times/week'
            }
        ],
        'muscle-building': [
            {
                name: 'Heavy Lifting',
                description: 'Focus on compound movements with heavy weights. Squats, deadlifts, bench press, and rows.',
                emoji: '🏋️',
                sets: '4-6 sets',
                reps: '4-8 reps',
                duration: '60-90 minutes',
                frequency: '4-5 times/week'
            },
            {
                name: 'Progressive Overload',
                description: 'Systematically increase weight, reps, or sets over time. Essential for muscle growth.',
                emoji: '📈',
                sets: '3-5 sets',
                reps: '6-12 reps',
                duration: '60 minutes',
                frequency: '4-6 times/week'
            },
            {
                name: 'Split Training',
                description: 'Focus on different muscle groups each day. Allows for better recovery and growth.',
                emoji: '🎯',
                sets: '4-5 sets',
                reps: '8-12 reps',
                duration: '60 minutes',
                frequency: '5-6 times/week'
            },
            {
                name: 'Isolation Exercises',
                description: 'Target specific muscles with focused movements. Bicep curls, tricep extensions, leg curls.',
                emoji: '🎯',
                sets: '3-4 sets',
                reps: '10-15 reps',
                duration: '30-45 minutes',
                frequency: '5-6 times/week'
            },
            {
                name: 'Pull-Ups & Dips',
                description: 'Bodyweight exercises that build upper body strength. Excellent for muscle building.',
                emoji: '🤸',
                sets: '3-5 sets',
                reps: '8-12 reps',
                duration: '20-30 minutes',
                frequency: '3-4 times/week'
            },
            {
                name: 'Leg Day Focus',
                description: 'Dedicated leg training with squats, lunges, and leg presses. Builds lower body mass.',
                emoji: '🦵',
                sets: '4-5 sets',
                reps: '8-12 reps',
                duration: '60 minutes',
                frequency: '2 times/week'
            }
        ]
    };
    
    return allExercises[plan] || [];
}

// Switch page
function switchPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${page}-page`).classList.add('active');
    const navBtn = document.querySelector(`[data-page="${page}"]`);
    if (navBtn) {
        navBtn.classList.add('active');
    }
    
    if (page === 'meals') {
        loadMeals();
    } else if (page === 'exercises') {
        loadExercises();
    } else if (page === 'meal-planner') {
        loadMealPlanner();
    } else if (page === 'consultation') {
        loadAppointments();
        loadDoctorsForBooking();
        setMinDate();
    } else if (page === 'doctor') {
        loadDoctorProfile();
        loadDoctorAppointments();
    }
}

// Show auth section
function showAuth() {
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('dashboard-section').classList.add('hidden');
}

// Show dashboard
function showDashboard(role) {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    
    // Update navigation based on role
    const navLinks = document.querySelector('.nav-links');
    if (role === 'doctor') {
        navLinks.innerHTML = `
            <button class="nav-btn active" data-page="doctor">Dashboard</button>
            <button class="nav-btn" id="logout-btn">Logout</button>
        `;
        document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.getAttribute('data-page');
                switchPage(page);
            });
        });
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
        switchPage('doctor');
    } else if (role === 'user') {
        navLinks.innerHTML = `
            <button class="nav-btn active" data-page="profile">Profile</button>
            <button class="nav-btn" data-page="meals">Meal Suggestions</button>
            <button class="nav-btn" data-page="meal-planner">Meal Planner</button>
            <button class="nav-btn" data-page="exercises">Exercises</button>
            <button class="nav-btn" data-page="consultation">Consultation</button>
            <button class="nav-btn" id="logout-btn">Logout</button>
        `;
        document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.getAttribute('data-page');
                switchPage(page);
            });
        });
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
        switchPage('profile');
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem(CURRENT_USER_ROLE_KEY);
        showAuth();
        document.getElementById('loginForm').reset();
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
document.addEventListener('DOMContentLoaded', () => {
    const heightInput = document.getElementById('profile-height');
    const weightInput = document.getElementById('profile-weight');
    
    if (heightInput && weightInput) {
        heightInput.addEventListener('input', updateBMI);
        weightInput.addEventListener('input', updateBMI);
    }
});

// Meal Planner Functions
const MEAL_PLANNER_KEY = 'nutriverse_meal_planner';

function loadMealPlanner() {
    const users = getUsers();
    const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
    const user = users.find(u => u.email === currentUserEmail);
    
    const plannerContainer = document.getElementById('meal-planner-container');
    
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
    const user = users.find(u => u.email === currentUserEmail);
    
    if (!user || !user.profile || !user.profile.diet || !user.profile.plan) {
        alert('Please complete your profile with diet type and fitness plan first!');
        return;
    }
    
    const diet = user.profile.diet;
    const plan = user.profile.plan;
    const availableMeals = getMealsByDietAndPlan(diet, plan);
    
    if (availableMeals.length === 0) {
        alert('No meals available for your diet type and plan. Please check your profile settings.');
        return;
    }
    
    // Get snack options (lighter meals suitable for snacks)
    const snackMeals = availableMeals.filter(meal => parseInt(meal.calories) <= 250);
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Evening Snack'];
    const weeklyPlan = {};
    
    days.forEach(day => {
        weeklyPlan[day] = {
            Breakfast: null,
            Lunch: null,
            Dinner: null,
            'Evening Snack': null
        };
        
        const usedMeals = new Set(); // Track meals used in this day to prevent duplicates
        
        mealTypes.forEach(mealType => {
            let selectedMeal;
            let attempts = 0;
            const maxAttempts = 50;
            
            // For snacks, prefer lighter meals
            const mealPool = mealType === 'Evening Snack' && snackMeals.length > 0 
                ? snackMeals 
                : availableMeals;
            
            // Keep trying until we find a meal that hasn't been used today
            do {
                selectedMeal = mealPool[Math.floor(Math.random() * mealPool.length)];
                attempts++;
                
                // If we've tried too many times, allow duplicates (better than no meal)
                if (attempts >= maxAttempts) {
                    break;
                }
            } while (usedMeals.has(selectedMeal.name));
            
            usedMeals.add(selectedMeal.name);
            
            weeklyPlan[day][mealType] = {
                name: selectedMeal.name,
                calories: parseInt(selectedMeal.calories),
                emoji: selectedMeal.emoji
            };
        });
    });
    
    saveMealPlan(currentUserEmail, weeklyPlan);
    displayMealPlan(weeklyPlan);
    alert('Weekly meal plan generated successfully!');
}

function displayMealPlan(mealPlan) {
    const plannerContainer = document.getElementById('meal-planner-container');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    plannerContainer.innerHTML = days.map(day => {
        const dayMeals = mealPlan[day];
        const totalCalories = (dayMeals.Breakfast?.calories || 0) + 
                             (dayMeals.Lunch?.calories || 0) + 
                             (dayMeals.Dinner?.calories || 0) +
                             (dayMeals['Evening Snack']?.calories || 0);
        
        return `
            <div class="day-card">
                <div class="day-header">${day}</div>
                <div class="meal-slot">
                    <div class="meal-slot-title">🌅 Breakfast</div>
                    ${dayMeals.Breakfast ? `
                        <div class="meal-item" onclick="showRecipeDetail('${dayMeals.Breakfast.name}')" style="cursor: pointer;">
                            <span class="meal-item-name">${dayMeals.Breakfast.emoji} ${dayMeals.Breakfast.name}</span>
                            <span class="meal-item-calories">${dayMeals.Breakfast.calories} cal</span>
                        </div>
                    ` : '<div class="meal-item"><span class="meal-item-name">Not planned</span></div>'}
                </div>
                <div class="meal-slot">
                    <div class="meal-slot-title">☀️ Lunch</div>
                    ${dayMeals.Lunch ? `
                        <div class="meal-item" onclick="showRecipeDetail('${dayMeals.Lunch.name}')" style="cursor: pointer;">
                            <span class="meal-item-name">${dayMeals.Lunch.emoji} ${dayMeals.Lunch.name}</span>
                            <span class="meal-item-calories">${dayMeals.Lunch.calories} cal</span>
                        </div>
                    ` : '<div class="meal-item"><span class="meal-item-name">Not planned</span></div>'}
                </div>
                <div class="meal-slot">
                    <div class="meal-slot-title">🌙 Dinner</div>
                    ${dayMeals.Dinner ? `
                        <div class="meal-item" onclick="showRecipeDetail('${dayMeals.Dinner.name}')" style="cursor: pointer;">
                            <span class="meal-item-name">${dayMeals.Dinner.emoji} ${dayMeals.Dinner.name}</span>
                            <span class="meal-item-calories">${dayMeals.Dinner.calories} cal</span>
                        </div>
                    ` : '<div class="meal-item"><span class="meal-item-name">Not planned</span></div>'}
                </div>
                <div class="meal-slot">
                    <div class="meal-slot-title">🍎 Evening Snack</div>
                    ${dayMeals['Evening Snack'] ? `
                        <div class="meal-item" onclick="showRecipeDetail('${dayMeals['Evening Snack'].name}')" style="cursor: pointer;">
                            <span class="meal-item-name">${dayMeals['Evening Snack'].emoji} ${dayMeals['Evening Snack'].name}</span>
                            <span class="meal-item-calories">${dayMeals['Evening Snack'].calories} cal</span>
                        </div>
                    ` : '<div class="meal-item"><span class="meal-item-name">Not planned</span></div>'}
                </div>
                <div class="day-total">
                    <span>Total Calories:</span>
                    <span>${totalCalories} cal</span>
                </div>
            </div>
        `;
    }).join('');
}

function clearMealPlan() {
    if (confirm('Are you sure you want to clear your meal plan?')) {
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
const APPOINTMENTS_KEY = 'nutriverse_appointments';

function setMinDate() {
    const dateInput = document.getElementById('consultation-date');
    if (dateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
    }
}

function handleConsultationBooking(e) {
    e.preventDefault();
    
    const date = document.getElementById('consultation-date').value;
    const time = document.getElementById('consultation-time').value;
    const doctor = document.getElementById('consultation-doctor').value;
    const reason = document.getElementById('consultation-reason').value;
    
    if (!doctor) {
        alert('Please select a doctor!');
        return;
    }
    
    const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
    const users = getUsers();
    const currentUser = users.find(u => u.email === currentUserEmail);
    const patientName = currentUser ? currentUser.profile.name : 'Patient';
    
    const appointment = {
        id: Date.now(),
        email: currentUserEmail,
        patientName: patientName,
        date,
        time,
        doctor,
        reason,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    const appointments = getAppointments();
    appointments.push(appointment);
    saveAppointments(appointments);
    
    document.getElementById('consultationForm').reset();
    loadAppointments();
    loadDoctorsForBooking();
    alert('Appointment booked successfully! You will receive a confirmation email shortly.');
}

// Load doctors for booking
function loadDoctorsForBooking() {
    const users = getUsers();
    const doctors = users.filter(u => u.role === 'doctor' && u.profile && u.profile.name);
    
    const doctorSelect = document.getElementById('consultation-doctor');
    const timeSelect = document.getElementById('consultation-time');
    
    doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
    
    doctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.email;
        option.textContent = `${doctor.profile.name} - ${doctor.profile.designation || 'Doctor'}`;
        doctorSelect.appendChild(option);
    });
    
    // Update times when doctor is selected
    doctorSelect.addEventListener('change', () => {
        updateAvailableTimes(doctorSelect.value);
    });
}

// Update available times based on selected doctor
function updateAvailableTimes(doctorEmail) {
    const users = getUsers();
    const doctor = users.find(u => u.email === doctorEmail && u.role === 'doctor');
    const timeSelect = document.getElementById('consultation-time');
    
    timeSelect.innerHTML = '<option value="">Select Time</option>';
    
    if (doctor && doctor.profile && doctor.profile.availableTimings) {
        const availableTimings = doctor.profile.availableTimings;
        const allTimes = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
        
        allTimes.forEach(time => {
            if (availableTimings.includes(time)) {
                const option = document.createElement('option');
                option.value = time;
                option.textContent = formatTime12Hour(time);
                timeSelect.appendChild(option);
            }
        });
    } else {
        // Default times if doctor hasn't set availability
        const defaultTimes = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
        defaultTimes.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = formatTime12Hour(time);
            timeSelect.appendChild(option);
        });
    }
}

function loadAppointments() {
    const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
    const appointments = getAppointments().filter(apt => apt.email === currentUserEmail);
    
    const appointmentsList = document.getElementById('appointments-list');
    
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
    
    // Get doctor names
    const users = getUsers();
    
    appointmentsList.innerHTML = appointments.map(apt => {
        const appointmentDate = new Date(apt.date);
        const formattedDate = appointmentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const time12hr = formatTime12Hour(apt.time);
        
        const doctor = users.find(u => u.email === apt.doctor);
        const doctorName = doctor && doctor.profile ? 
            `${doctor.profile.name} - ${doctor.profile.designation || 'Doctor'}` : 
            apt.doctor;
        
        return `
            <div class="appointment-item">
                <div class="appointment-header">
                    <div>
                        <div class="appointment-doctor">${doctorName}</div>
                        <div class="appointment-date-time">📅 ${formattedDate} at ${time12hr}</div>
                    </div>
                </div>
                <div class="appointment-reason">${apt.reason}</div>
                <span class="appointment-status ${apt.status}">${apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}</span>
                <button class="delete-appointment" onclick="deleteAppointment(${apt.id})">Cancel Appointment</button>
            </div>
        `;
    }).join('');
}

function formatTime12Hour(time24) {
    const [hours, minutes] = time24.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
}

function deleteAppointment(id) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        const appointments = getAppointments();
        const filtered = appointments.filter(apt => apt.id !== id);
        saveAppointments(filtered);
        loadAppointments();
    }
}

// Make deleteAppointment and showRecipeDetail available globally
window.deleteAppointment = deleteAppointment;
window.showRecipeDetail = showRecipeDetail;

// Recipe Detail Functions
function showRecipeDetail(mealIdentifier) {
    const recipe = getRecipeDetails(mealIdentifier);
    if (!recipe) {
        alert('Recipe details not found');
        return;
    }
    
    const modal = document.getElementById('recipe-modal');
    const content = document.getElementById('recipe-detail-content');
    
    content.innerHTML = `
        <div class="recipe-detail">
            <div class="recipe-header">
                <h2 class="recipe-title">
                    <span class="recipe-title-emoji">${recipe.emoji}</span>
                    ${recipe.name}
                </h2>
                <div class="recipe-meta">
                    <span class="recipe-meta-tag ${recipe.diet}">${recipe.dietLabel}</span>
                    <span class="recipe-meta-tag">${recipe.calories} calories</span>
                    <span class="recipe-meta-tag">${recipe.planLabel || ''}</span>
                </div>
            </div>
            <p class="recipe-description">${recipe.description}</p>
            
            <div class="recipe-section">
                <h3 class="recipe-section-title">📋 Ingredients</h3>
                <ul class="ingredients-list">
                    ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                </ul>
            </div>
            
            <div class="recipe-section">
                <h3 class="recipe-section-title">👨‍🍳 Instructions</h3>
                <ol class="instructions-list">
                    ${recipe.instructions.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
            
            ${recipe.nutrition ? `
                <div class="recipe-nutrition">
                    <h4>💪 Nutrition Information</h4>
                    ${recipe.nutrition}
                </div>
            ` : ''}
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function getRecipeDetails(mealIdentifier) {
    const allRecipes = getAllRecipes();
    return allRecipes.find(r => r.id === mealIdentifier || r.name === mealIdentifier);
}

function getAllRecipes() {
    return [
        // Vegetarian Recipes
        {
            id: 'Vegetable Stir Fry',
            name: 'Vegetable Stir Fry',
            emoji: '🥗',
            diet: 'veg',
            dietLabel: 'Vegetarian',
            calories: '180',
            description: 'Fresh seasonal vegetables stir-fried with garlic, ginger, and light soy sauce. Low calorie, high fiber.',
            ingredients: [
                '2 cups mixed vegetables (bell peppers, broccoli, carrots, snow peas)',
                '2 cloves garlic, minced',
                '1 inch ginger, grated',
                '2 tbsp soy sauce (low sodium)',
                '1 tbsp sesame oil',
                '1 tsp rice vinegar',
                'Salt and pepper to taste',
                '2 tbsp vegetable oil'
            ],
            instructions: [
                'Heat vegetable oil in a large wok or pan over high heat.',
                'Add minced garlic and grated ginger, stir for 30 seconds until fragrant.',
                'Add harder vegetables (carrots, broccoli) first and stir-fry for 2-3 minutes.',
                'Add remaining vegetables and continue stir-frying for 2-3 more minutes.',
                'Add soy sauce, sesame oil, and rice vinegar. Mix well.',
                'Season with salt and pepper. Cook for 1 more minute.',
                'Serve hot over rice or as a side dish.'
            ],
            nutrition: '<p><strong>Protein:</strong> 5g | <strong>Carbs:</strong> 20g | <strong>Fat:</strong> 8g | <strong>Fiber:</strong> 6g</p>'
        },
        {
            id: 'Chana Masala',
            name: 'Chana Masala',
            emoji: '🍲',
            diet: 'veg',
            dietLabel: 'Vegetarian',
            calories: '350',
            description: 'Spiced chickpeas cooked in a tangy tomato-based gravy, rich in protein.',
            ingredients: [
                '2 cups cooked chickpeas',
                '2 large tomatoes, chopped',
                '1 large onion, finely chopped',
                '2 tbsp oil',
                '1 tsp cumin seeds',
                '1 tbsp garam masala',
                '1 tsp turmeric powder',
                '1 tsp coriander powder',
                '1/2 tsp red chili powder',
                '1 inch ginger, grated',
                '3 cloves garlic, minced',
                'Fresh cilantro for garnish',
                'Salt to taste'
            ],
            instructions: [
                'Heat oil in a pan and add cumin seeds. Let them splutter.',
                'Add chopped onions and sauté until golden brown.',
                'Add ginger and garlic, cook for 1 minute.',
                'Add all dry spices (turmeric, coriander, chili powder) and mix well.',
                'Add chopped tomatoes and cook until they become soft and mushy.',
                'Add cooked chickpeas and mix well. Add 1 cup water.',
                'Simmer for 10-15 minutes until gravy thickens.',
                'Add garam masala and salt. Mix well.',
                'Garnish with fresh cilantro and serve hot with rice or roti.'
            ],
            nutrition: '<p><strong>Protein:</strong> 15g | <strong>Carbs:</strong> 45g | <strong>Fat:</strong> 10g | <strong>Fiber:</strong> 12g</p>'
        },
        {
            id: 'Paneer Tikka',
            name: 'Paneer Tikka',
            emoji: '🍢',
            diet: 'veg',
            dietLabel: 'Vegetarian',
            calories: '320',
            description: 'Marinated cottage cheese cubes grilled to perfection. High protein, moderate calories.',
            ingredients: [
                '250g paneer (cottage cheese), cut into cubes',
                '1/2 cup thick yogurt',
                '1 tbsp ginger-garlic paste',
                '1 tsp turmeric powder',
                '1 tsp red chili powder',
                '1 tsp garam masala',
                '1 tsp cumin powder',
                '1 tbsp lemon juice',
                '1 bell pepper, cut into squares',
                '1 onion, cut into squares',
                '2 tbsp oil',
                'Salt to taste'
            ],
            instructions: [
                'Mix yogurt, ginger-garlic paste, all spices, lemon juice, and salt in a bowl.',
                'Add paneer cubes and vegetables. Mix well to coat everything.',
                'Marinate for at least 30 minutes (longer is better).',
                'Preheat oven to 200°C or prepare grill pan.',
                'Thread paneer and vegetables onto skewers (if using).',
                'Brush with oil and grill/bake for 15-20 minutes, turning occasionally.',
                'Cook until paneer is golden and slightly charred.',
                'Serve hot with mint chutney and onion rings.'
            ],
            nutrition: '<p><strong>Protein:</strong> 20g | <strong>Carbs:</strong> 15g | <strong>Fat:</strong> 18g | <strong>Calcium:</strong> High</p>'
        },
        {
            id: 'Vegetable Biryani',
            name: 'Vegetable Biryani',
            emoji: '🍛',
            diet: 'veg',
            dietLabel: 'Vegetarian',
            calories: '450',
            description: 'Aromatic basmati rice cooked with mixed vegetables, spices, and herbs.',
            ingredients: [
                '2 cups basmati rice',
                '2 cups mixed vegetables (potatoes, carrots, beans, peas)',
                '2 large onions, sliced',
                '2 tomatoes, chopped',
                '1/2 cup yogurt',
                '2 tbsp biryani masala',
                '1 tsp turmeric',
                'Whole spices (bay leaf, cardamom, cinnamon, cloves)',
                '2 tbsp ghee or oil',
                'Fresh mint and cilantro',
                'Saffron strands (optional)',
                'Salt to taste'
            ],
            instructions: [
                'Wash and soak basmati rice for 30 minutes. Parboil rice until 70% cooked.',
                'Heat ghee/oil in a large pot. Add whole spices and let them splutter.',
                'Add sliced onions and fry until golden brown. Remove half for garnish.',
                'Add vegetables and cook for 5 minutes.',
                'Add tomatoes, yogurt, and all spices. Cook until vegetables are tender.',
                'Layer half the rice, then vegetable mixture, then remaining rice.',
                'Add saffron soaked in milk, fried onions, mint, and cilantro on top.',
                'Cover and cook on low heat (dum) for 20-25 minutes.',
                'Let it rest for 10 minutes before serving. Mix gently and serve.'
            ],
            nutrition: '<p><strong>Protein:</strong> 12g | <strong>Carbs:</strong> 75g | <strong>Fat:</strong> 12g | <strong>Fiber:</strong> 8g</p>'
        },
        {
            id: 'Dal Makhani',
            name: 'Dal Makhani',
            emoji: '🥘',
            diet: 'veg',
            dietLabel: 'Vegetarian',
            calories: '280',
            description: 'Creamy black lentils cooked with butter and spices. High protein.',
            ingredients: [
                '1 cup whole black lentils (urad dal)',
                '1/4 cup kidney beans (rajma)',
                '2 tbsp butter',
                '1 large onion, finely chopped',
                '2 tomatoes, pureed',
                '1 tbsp ginger-garlic paste',
                '1 tsp cumin seeds',
                '1 tsp garam masala',
                '1 tsp red chili powder',
                '1/2 cup cream',
                'Fresh cilantro',
                'Salt to taste'
            ],
            instructions: [
                'Soak black lentils and kidney beans overnight. Pressure cook until soft.',
                'Heat butter in a pan. Add cumin seeds and let them splutter.',
                'Add chopped onions and cook until golden brown.',
                'Add ginger-garlic paste and cook for 1 minute.',
                'Add tomato puree and all spices. Cook until oil separates.',
                'Add cooked lentils and beans. Mix well and add water if needed.',
                'Simmer for 20-30 minutes on low heat, stirring occasionally.',
                'Add cream and mix well. Cook for 5 more minutes.',
                'Garnish with cilantro and serve hot with rice or naan.'
            ],
            nutrition: '<p><strong>Protein:</strong> 18g | <strong>Carbs:</strong> 35g | <strong>Fat:</strong> 10g | <strong>Fiber:</strong> 15g</p>'
        },
        {
            id: 'Green Salad Bowl',
            name: 'Green Salad Bowl',
            emoji: '🥬',
            diet: 'veg',
            dietLabel: 'Vegetarian',
            calories: '150',
            description: 'Fresh mixed greens with vegetables, nuts, and light dressing.',
            ingredients: [
                '3 cups mixed greens (lettuce, spinach, arugula)',
                '1 cucumber, sliced',
                '1 tomato, chopped',
                '1/2 cup bell peppers, sliced',
                '1/4 cup red onion, thinly sliced',
                '2 tbsp nuts (almonds, walnuts)',
                '2 tbsp olive oil',
                '1 tbsp lemon juice',
                '1 tsp honey',
                'Salt and pepper to taste'
            ],
            instructions: [
                'Wash and dry all greens thoroughly.',
                'Chop all vegetables into bite-sized pieces.',
                'In a large bowl, combine all greens and vegetables.',
                'In a small bowl, whisk together olive oil, lemon juice, honey, salt, and pepper.',
                'Drizzle dressing over the salad and toss gently.',
                'Top with nuts and serve immediately.'
            ],
            nutrition: '<p><strong>Protein:</strong> 4g | <strong>Carbs:</strong> 12g | <strong>Fat:</strong> 10g | <strong>Fiber:</strong> 5g</p>'
        },
        // Non-Vegetarian Recipes
        {
            id: 'Grilled Chicken Breast',
            name: 'Grilled Chicken Breast',
            emoji: '🍗',
            diet: 'non-veg',
            dietLabel: 'Non-Vegetarian',
            calories: '250',
            description: 'Tender chicken breast marinated in herbs and spices, grilled to perfection.',
            ingredients: [
                '2 chicken breasts (skinless, boneless)',
                '2 tbsp olive oil',
                '2 cloves garlic, minced',
                '1 tsp paprika',
                '1 tsp dried oregano',
                '1/2 tsp black pepper',
                '1/2 tsp salt',
                '1 tbsp lemon juice',
                'Fresh herbs for garnish'
            ],
            instructions: [
                'Pound chicken breasts to even thickness (about 1/2 inch).',
                'Mix olive oil, garlic, paprika, oregano, pepper, salt, and lemon juice.',
                'Coat chicken breasts with marinade and let sit for 30 minutes.',
                'Preheat grill or grill pan to medium-high heat.',
                'Grill chicken for 6-7 minutes per side until internal temperature reaches 165°F.',
                'Let rest for 5 minutes before slicing.',
                'Garnish with fresh herbs and serve with vegetables.'
            ],
            nutrition: '<p><strong>Protein:</strong> 35g | <strong>Carbs:</strong> 2g | <strong>Fat:</strong> 10g | <strong>Iron:</strong> High</p>'
        },
        {
            id: 'Prawn Stir Fry',
            name: 'Prawn Stir Fry',
            emoji: '🦐',
            diet: 'non-veg',
            dietLabel: 'Non-Vegetarian',
            calories: '200',
            description: 'Fresh prawns stir-fried with vegetables, garlic, and ginger.',
            ingredients: [
                '300g prawns, cleaned and deveined',
                '1 cup mixed vegetables (bell peppers, snow peas)',
                '3 cloves garlic, minced',
                '1 inch ginger, grated',
                '2 tbsp soy sauce',
                '1 tbsp oyster sauce',
                '1 tsp sesame oil',
                '2 tbsp vegetable oil',
                'Spring onions for garnish',
                'Salt and pepper to taste'
            ],
            instructions: [
                'Pat dry prawns and season with salt and pepper.',
                'Heat vegetable oil in a wok over high heat.',
                'Add prawns and cook for 2 minutes per side. Remove and set aside.',
                'In the same wok, add garlic and ginger. Stir for 30 seconds.',
                'Add vegetables and stir-fry for 2-3 minutes.',
                'Return prawns to wok. Add soy sauce and oyster sauce.',
                'Toss everything together and cook for 1 more minute.',
                'Drizzle sesame oil and garnish with spring onions. Serve hot.'
            ],
            nutrition: '<p><strong>Protein:</strong> 25g | <strong>Carbs:</strong> 8g | <strong>Fat:</strong> 6g | <strong>Omega-3:</strong> Good</p>'
        },
        {
            id: 'Fish Curry',
            name: 'Fish Curry',
            emoji: '🐟',
            diet: 'non-veg',
            dietLabel: 'Non-Vegetarian',
            calories: '320',
            description: 'Fresh fish cooked in a spicy coconut-based curry.',
            ingredients: [
                '500g fish fillets (any white fish)',
                '1 cup coconut milk',
                '2 onions, sliced',
                '2 tomatoes, chopped',
                '1 tbsp curry powder',
                '1 tsp turmeric',
                '1 tsp red chili powder',
                '2 tbsp oil',
                'Curry leaves',
                'Salt to taste'
            ],
            instructions: [
                'Clean and cut fish into pieces. Marinate with turmeric and salt.',
                'Heat oil in a pan. Add curry leaves and sliced onions.',
                'Cook onions until golden. Add tomatoes and cook until soft.',
                'Add all spices and cook for 2 minutes.',
                'Add coconut milk and bring to a gentle boil.',
                'Add fish pieces carefully. Simmer for 10-15 minutes.',
                'Do not over-stir to keep fish intact.',
                'Garnish with fresh curry leaves and serve with rice.'
            ],
            nutrition: '<p><strong>Protein:</strong> 28g | <strong>Carbs:</strong> 12g | <strong>Fat:</strong> 15g | <strong>Omega-3:</strong> Excellent</p>'
        },
        {
            id: 'Mutton Biryani',
            name: 'Mutton Biryani',
            emoji: '🍛',
            diet: 'non-veg',
            dietLabel: 'Non-Vegetarian',
            calories: '550',
            description: 'Fragrant basmati rice layered with tender mutton, spices, and fried onions.',
            ingredients: [
                '500g mutton, cut into pieces',
                '2 cups basmati rice',
                '2 large onions, sliced',
                '2 tomatoes, chopped',
                '1/2 cup yogurt',
                '2 tbsp biryani masala',
                'Whole spices (bay leaf, cardamom, cinnamon, cloves)',
                '2 tbsp ghee',
                'Saffron strands',
                'Fresh mint and cilantro',
                'Salt to taste'
            ],
            instructions: [
                'Marinate mutton with yogurt, biryani masala, and salt for 2 hours.',
                'Cook mutton in pressure cooker until tender (about 20 minutes).',
                'Soak and parboil basmati rice until 70% cooked.',
                'Heat ghee and fry onions until golden. Remove half for garnish.',
                'In the same pot, layer half rice, then mutton, then remaining rice.',
                'Add saffron, fried onions, mint, and cilantro on top.',
                'Cover tightly and cook on low heat (dum) for 25-30 minutes.',
                'Let rest for 10 minutes. Mix gently and serve hot.'
            ],
            nutrition: '<p><strong>Protein:</strong> 35g | <strong>Carbs:</strong> 70g | <strong>Fat:</strong> 18g | <strong>Iron:</strong> High</p>'
        },
        {
            id: 'Chicken Tikka Masala',
            name: 'Chicken Tikka Masala',
            emoji: '🍗',
            diet: 'non-veg',
            dietLabel: 'Non-Vegetarian',
            calories: '420',
            description: 'Tender chicken pieces in a creamy tomato-based curry.',
            ingredients: [
                '500g chicken, cut into pieces',
                '1 cup tomato puree',
                '1/2 cup cream',
                '1 large onion, chopped',
                '2 tbsp butter',
                '1 tbsp garam masala',
                '1 tsp turmeric',
                '1 tsp red chili powder',
                '1 tbsp ginger-garlic paste',
                'Fresh cilantro',
                'Salt to taste'
            ],
            instructions: [
                'Marinate chicken with yogurt, spices, and salt for 1 hour.',
                'Grill or pan-fry chicken until cooked. Set aside.',
                'Heat butter in a pan. Add onions and cook until soft.',
                'Add ginger-garlic paste and cook for 1 minute.',
                'Add tomato puree and all spices. Cook until oil separates.',
                'Add cream and mix well. Add cooked chicken.',
                'Simmer for 10 minutes until sauce thickens.',
                'Garnish with cilantro and serve with rice or naan.'
            ],
            nutrition: '<p><strong>Protein:</strong> 32g | <strong>Carbs:</strong> 15g | <strong>Fat:</strong> 22g | <strong>Calcium:</strong> Good</p>'
        },
        {
            id: 'Egg Curry',
            name: 'Egg Curry',
            emoji: '🥚',
            diet: 'non-veg',
            dietLabel: 'Non-Vegetarian',
            calories: '280',
            description: 'Hard-boiled eggs in a spicy onion-tomato gravy.',
            ingredients: [
                '6 hard-boiled eggs',
                '2 onions, chopped',
                '2 tomatoes, chopped',
                '1 tbsp ginger-garlic paste',
                '1 tsp turmeric',
                '1 tsp red chili powder',
                '1 tsp garam masala',
                '2 tbsp oil',
                'Fresh cilantro',
                'Salt to taste'
            ],
            instructions: [
                'Boil eggs, peel, and make small slits on them.',
                'Heat oil in a pan. Add chopped onions and cook until golden.',
                'Add ginger-garlic paste and cook for 1 minute.',
                'Add tomatoes and cook until soft and mushy.',
                'Add all spices and mix well. Add 1 cup water.',
                'Add boiled eggs and simmer for 10 minutes.',
                'Garnish with cilantro and serve hot with rice or roti.'
            ],
            nutrition: '<p><strong>Protein:</strong> 18g | <strong>Carbs:</strong> 12g | <strong>Fat:</strong> 15g | <strong>Vitamin B12:</strong> High</p>'
        },
        {
            id: 'Grilled Salmon',
            name: 'Grilled Salmon',
            emoji: '🐟',
            diet: 'non-veg',
            dietLabel: 'Non-Vegetarian',
            calories: '300',
            description: 'Omega-3 rich salmon grilled with herbs.',
            ingredients: [
                '2 salmon fillets (150g each)',
                '2 tbsp olive oil',
                '1 lemon, juiced',
                '2 cloves garlic, minced',
                '1 tsp dried dill',
                '1/2 tsp black pepper',
                'Salt to taste',
                'Lemon wedges for serving'
            ],
            instructions: [
                'Pat dry salmon fillets and season with salt and pepper.',
                'Mix olive oil, lemon juice, garlic, and dill.',
                'Brush marinade on both sides of salmon.',
                'Preheat grill or grill pan to medium-high.',
                'Grill salmon skin-side down for 4-5 minutes.',
                'Flip and grill for 3-4 more minutes until flaky.',
                'Serve with lemon wedges and steamed vegetables.'
            ],
            nutrition: '<p><strong>Protein:</strong> 30g | <strong>Carbs:</strong> 0g | <strong>Fat:</strong> 18g | <strong>Omega-3:</strong> Very High</p>'
        },
        // Vegan Recipes
        {
            id: 'Chickpea Salad',
            name: 'Chickpea Salad',
            emoji: '🥙',
            diet: 'vegan',
            dietLabel: 'Vegan',
            calories: '220',
            description: 'Fresh chickpeas mixed with vegetables, herbs, and lemon-olive oil dressing.',
            ingredients: [
                '2 cups cooked chickpeas',
                '1 cucumber, diced',
                '1 tomato, diced',
                '1/2 red onion, finely chopped',
                '1/4 cup fresh parsley, chopped',
                '2 tbsp olive oil',
                '2 tbsp lemon juice',
                '1 tsp cumin powder',
                'Salt and pepper to taste'
            ],
            instructions: [
                'Drain and rinse cooked chickpeas thoroughly.',
                'Combine chickpeas with all vegetables in a large bowl.',
                'In a small bowl, whisk olive oil, lemon juice, and cumin.',
                'Pour dressing over salad and toss gently.',
                'Add fresh parsley and season with salt and pepper.',
                'Let marinate for 15 minutes before serving.',
                'Serve chilled or at room temperature.'
            ],
            nutrition: '<p><strong>Protein:</strong> 12g | <strong>Carbs:</strong> 30g | <strong>Fat:</strong> 8g | <strong>Fiber:</strong> 10g</p>'
        },
        {
            id: 'Lentil Curry',
            name: 'Lentil Curry',
            emoji: '🍲',
            diet: 'vegan',
            dietLabel: 'Vegan',
            calories: '250',
            description: 'Protein-rich red lentils cooked with tomatoes, onions, and spices.',
            ingredients: [
                '1 cup red lentils',
                '1 large onion, chopped',
                '2 tomatoes, chopped',
                '2 cloves garlic, minced',
                '1 inch ginger, grated',
                '1 tsp turmeric',
                '1 tsp cumin powder',
                '1 tsp coriander powder',
                '1/2 tsp red chili powder',
                '2 tbsp oil',
                'Fresh cilantro',
                'Salt to taste'
            ],
            instructions: [
                'Wash red lentils until water runs clear.',
                'Heat oil in a pot. Add onions and cook until golden.',
                'Add garlic and ginger. Cook for 1 minute.',
                'Add tomatoes and all spices. Cook until tomatoes are soft.',
                'Add lentils and 3 cups water. Bring to a boil.',
                'Reduce heat and simmer for 20-25 minutes until lentils are soft.',
                'Stir occasionally and add more water if needed.',
                'Garnish with cilantro and serve with rice or bread.'
            ],
            nutrition: '<p><strong>Protein:</strong> 18g | <strong>Carbs:</strong> 40g | <strong>Fat:</strong> 6g | <strong>Fiber:</strong> 15g</p>'
        },
        {
            id: 'Quinoa Buddha Bowl',
            name: 'Quinoa Buddha Bowl',
            emoji: '🥗',
            diet: 'vegan',
            dietLabel: 'Vegan',
            calories: '380',
            description: 'Nutritious quinoa topped with roasted vegetables, chickpeas, and tahini dressing.',
            ingredients: [
                '1 cup cooked quinoa',
                '1 cup roasted vegetables (sweet potato, broccoli, bell peppers)',
                '1/2 cup chickpeas',
                '2 tbsp tahini',
                '2 tbsp lemon juice',
                '1 tbsp maple syrup',
                '2 tbsp water',
                'Handful of greens',
                'Salt and pepper to taste'
            ],
            instructions: [
                'Cook quinoa according to package instructions. Let cool.',
                'Roast vegetables at 200°C for 20-25 minutes until tender.',
                'Make tahini dressing: mix tahini, lemon juice, maple syrup, and water.',
                'In a bowl, layer quinoa, roasted vegetables, and chickpeas.',
                'Add fresh greens on top.',
                'Drizzle tahini dressing over the bowl.',
                'Season with salt and pepper and serve.'
            ],
            nutrition: '<p><strong>Protein:</strong> 15g | <strong>Carbs:</strong> 55g | <strong>Fat:</strong> 12g | <strong>Fiber:</strong> 12g</p>'
        },
        {
            id: 'Vegan Pad Thai',
            name: 'Vegan Pad Thai',
            emoji: '🍜',
            diet: 'vegan',
            dietLabel: 'Vegan',
            calories: '420',
            description: 'Rice noodles stir-fried with tofu, vegetables, and tangy tamarind sauce.',
            ingredients: [
                '200g rice noodles',
                '200g firm tofu, cubed',
                '2 cups bean sprouts',
                '2 carrots, julienned',
                '3 cloves garlic, minced',
                '2 tbsp tamarind paste',
                '2 tbsp soy sauce',
                '1 tbsp maple syrup',
                '2 tbsp oil',
                'Lime wedges',
                'Chopped peanuts',
                'Fresh cilantro'
            ],
            instructions: [
                'Soak rice noodles in warm water for 20 minutes. Drain.',
                'Press tofu to remove excess water. Pan-fry until golden.',
                'Heat oil in a wok. Add garlic and stir for 30 seconds.',
                'Add carrots and stir-fry for 2 minutes.',
                'Add noodles and toss gently.',
                'Mix tamarind, soy sauce, and maple syrup. Add to wok.',
                'Add tofu and bean sprouts. Toss everything together.',
                'Garnish with peanuts, cilantro, and lime. Serve hot.'
            ],
            nutrition: '<p><strong>Protein:</strong> 18g | <strong>Carbs:</strong> 65g | <strong>Fat:</strong> 12g | <strong>Fiber:</strong> 8g</p>'
        },
        {
            id: 'Tofu Scramble',
            name: 'Tofu Scramble',
            emoji: '🍳',
            diet: 'vegan',
            dietLabel: 'Vegan',
            calories: '200',
            description: 'Scrambled tofu with vegetables, turmeric, and spices.',
            ingredients: [
                '300g firm tofu, crumbled',
                '1/2 onion, chopped',
                '1 bell pepper, chopped',
                '1 tsp turmeric',
                '1/2 tsp black salt (kala namak)',
                '1/2 tsp black pepper',
                '1 tbsp nutritional yeast',
                '2 tbsp oil',
                'Fresh chives',
                'Salt to taste'
            ],
            instructions: [
                'Crumble tofu with hands or fork.',
                'Heat oil in a pan. Add onions and bell peppers.',
                'Cook for 3-4 minutes until vegetables are soft.',
                'Add crumbled tofu and all spices.',
                'Cook for 5-7 minutes, stirring occasionally.',
                'Add nutritional yeast and mix well.',
                'Garnish with fresh chives and serve hot.'
            ],
            nutrition: '<p><strong>Protein:</strong> 20g | <strong>Carbs:</strong> 8g | <strong>Fat:</strong> 12g | <strong>Calcium:</strong> High</p>'
        },
        {
            id: 'Vegan Pasta',
            name: 'Vegan Pasta',
            emoji: '🍝',
            diet: 'vegan',
            dietLabel: 'Vegan',
            calories: '350',
            description: 'Whole wheat pasta with marinara sauce, vegetables, and nutritional yeast.',
            ingredients: [
                '200g whole wheat pasta',
                '2 cups marinara sauce',
                '1 cup mixed vegetables (zucchini, mushrooms, bell peppers)',
                '3 cloves garlic, minced',
                '2 tbsp olive oil',
                '2 tbsp nutritional yeast',
                'Fresh basil',
                'Salt and pepper to taste'
            ],
            instructions: [
                'Cook pasta according to package instructions. Reserve 1/2 cup pasta water.',
                'Heat olive oil in a pan. Add garlic and cook for 30 seconds.',
                'Add vegetables and cook for 5-7 minutes until tender.',
                'Add marinara sauce and bring to a simmer.',
                'Add cooked pasta and toss together.',
                'Add pasta water if needed for consistency.',
                'Stir in nutritional yeast and fresh basil.',
                'Season with salt and pepper. Serve hot.'
            ],
            nutrition: '<p><strong>Protein:</strong> 14g | <strong>Carbs:</strong> 60g | <strong>Fat:</strong> 8g | <strong>Fiber:</strong> 10g</p>'
        },
        {
            id: 'Green Smoothie Bowl',
            name: 'Green Smoothie Bowl',
            emoji: '🥤',
            diet: 'vegan',
            dietLabel: 'Vegan',
            calories: '180',
            description: 'Nutrient-dense smoothie bowl with fruits, greens, and plant-based protein.',
            ingredients: [
                '2 cups spinach',
                '1 banana, frozen',
                '1/2 cup mango, frozen',
                '1/2 cup plant-based milk',
                '1 tbsp chia seeds',
                '1 tbsp almond butter',
                'Toppings: berries, granola, coconut flakes'
            ],
            instructions: [
                'Blend spinach, frozen fruits, and plant-based milk until smooth.',
                'Add chia seeds and almond butter. Blend again.',
                'Pour into a bowl (should be thick, not runny).',
                'Top with fresh berries, granola, and coconut flakes.',
                'Serve immediately while cold.'
            ],
            nutrition: '<p><strong>Protein:</strong> 8g | <strong>Carbs:</strong> 35g | <strong>Fat:</strong> 6g | <strong>Fiber:</strong> 8g</p>'
        }
    ];
}

function getAppointments() {
    const appointments = localStorage.getItem(APPOINTMENTS_KEY);
    return appointments ? JSON.parse(appointments) : [];
}

function saveAppointments(appointments) {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
}

// Doctor Functions
function handleDoctorProfileSave(e) {
    e.preventDefault();
    const name = document.getElementById('doctor-name').value;
    const designation = document.getElementById('doctor-designation').value;
    const timingCheckboxes = document.querySelectorAll('.timing-checkbox:checked');
    const availableTimings = Array.from(timingCheckboxes).map(cb => cb.value);
    
    const users = getUsers();
    const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
    const userIndex = users.findIndex(u => u.email === currentUserEmail);
    
    if (userIndex !== -1) {
        users[userIndex].profile = {
            name,
            designation,
            availableTimings
        };
        saveUsers(users);
        alert('Profile saved successfully!');
        loadDoctorsForBooking(); // Update doctor list for bookings
    }
}

function loadDoctorProfile() {
    const users = getUsers();
    const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
    const doctor = users.find(u => u.email === currentUserEmail && u.role === 'doctor');
    
    if (doctor && doctor.profile) {
        document.getElementById('doctor-name').value = doctor.profile.name || '';
        document.getElementById('doctor-designation').value = doctor.profile.designation || '';
        
        const availableTimings = doctor.profile.availableTimings || [];
        document.querySelectorAll('.timing-checkbox').forEach(checkbox => {
            checkbox.checked = availableTimings.includes(checkbox.value);
        });
    }
}

function loadDoctorAppointments() {
    const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
    const appointments = getAppointments().filter(apt => apt.doctor === currentUserEmail);
    
    const appointmentsList = document.getElementById('doctor-appointments-list');
    
    if (appointments.length === 0) {
        appointmentsList.innerHTML = `
            <div class="empty-state">
                <h3>No Appointments</h3>
                <p>You don't have any appointments yet.</p>
            </div>
        `;
        return;
    }
    
    // Sort appointments by date
    appointments.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    appointmentsList.innerHTML = appointments.map(apt => {
        const appointmentDate = new Date(apt.date);
        const formattedDate = appointmentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const time12hr = formatTime12Hour(apt.time);
        
        return `
            <div class="appointment-item">
                <div class="appointment-header">
                    <div>
                        <div class="appointment-doctor">${apt.patientName || 'Patient'}</div>
                        <div class="appointment-date-time">📅 ${formattedDate} at ${time12hr}</div>
                    </div>
                </div>
                <div class="appointment-patient-info">
                    <strong>Email:</strong> ${apt.email}<br>
                    <strong>Reason:</strong> ${apt.reason}
                </div>
                <span class="appointment-status ${apt.status}">${apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}</span>
                <div class="appointment-actions">
                    ${apt.status === 'pending' ? `
                        <button class="accept-appointment" onclick="acceptAppointment(${apt.id})">Accept</button>
                        <button class="cancel-appointment" onclick="cancelAppointmentByDoctor(${apt.id})">Cancel</button>
                    ` : apt.status === 'confirmed' ? `
                        <button class="cancel-appointment" onclick="cancelAppointmentByDoctor(${apt.id})">Cancel</button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function acceptAppointment(id) {
    const appointments = getAppointments();
    const appointment = appointments.find(apt => apt.id === id);
    
    if (appointment) {
        appointment.status = 'confirmed';
        saveAppointments(appointments);
        loadDoctorAppointments();
        alert('Appointment accepted successfully!');
    }
}

function cancelAppointmentByDoctor(id) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        const appointments = getAppointments();
        const appointment = appointments.find(apt => apt.id === id);
        
        if (appointment) {
            appointment.status = 'cancelled';
            saveAppointments(appointments);
            loadDoctorAppointments();
            alert('Appointment cancelled successfully!');
        }
    }
}

// Make functions available globally
window.acceptAppointment = acceptAppointment;
window.cancelAppointmentByDoctor = cancelAppointmentByDoctor;

