// Get meals data
const getMealsByDietAndPlan = (diet, plan) => {
  const allMeals = {
    veg: [
      {
        name: "Vegetable Stir Fry",
        description: "Fresh seasonal vegetables stir-fried with garlic, ginger, and light soy sauce. Low calorie, high fiber.",
        emoji: "🥗",
        diet: "veg",
        dietLabel: "Vegetarian",
        calories: 180,
        plans: ["weight-loss", "fat-loss"],
        recipe: {
          ingredients: ["2 cups mixed vegetables (bell peppers, broccoli, carrots)", "2 cloves garlic, minced", "1 inch ginger, grated", "1 tbsp soy sauce", "1 tsp sesame oil", "Salt and pepper to taste"],
          instructions: ["Heat sesame oil in a large pan", "Add garlic and ginger, sauté for 30 seconds", "Add vegetables and stir-fry for 5-7 minutes", "Add soy sauce, salt, and pepper", "Serve hot"]
        }
      },
      {
        name: "Chana Masala",
        description: "Spiced chickpeas cooked in a tangy tomato-based gravy, rich in protein. Perfect for muscle building.",
        emoji: "🍲",
        diet: "veg",
        dietLabel: "Vegetarian",
        calories: 350,
        plans: ["muscle-building", "weight-gain"],
        recipe: {
          ingredients: ["2 cups cooked chickpeas", "2 large tomatoes, chopped", "1 large onion, chopped", "2 cloves garlic, minced", "1 inch ginger, grated", "1 tsp cumin seeds", "1 tsp coriander powder", "1/2 tsp turmeric", "1/2 tsp red chili powder", "2 tbsp oil", "Salt to taste", "Fresh cilantro for garnish"],
          instructions: ["Heat oil in a pan and add cumin seeds", "Add onions and sauté until golden", "Add garlic and ginger, cook for 1 minute", "Add tomatoes and spices, cook until tomatoes are soft", "Add chickpeas and 1 cup water", "Simmer for 15-20 minutes until gravy thickens", "Garnish with cilantro and serve hot"]
        }
      },
      {
        name: "Paneer Tikka",
        description: "Marinated cottage cheese cubes grilled to perfection. High protein, moderate calories.",
        emoji: "🍢",
        diet: "veg",
        dietLabel: "Vegetarian",
        calories: 320,
        plans: ["muscle-building", "weight-gain", "fat-loss"],
        recipe: {
          ingredients: ["250g paneer, cut into cubes", "1/2 cup yogurt", "1 tbsp gram flour", "1 tsp garam masala", "1 tsp red chili powder", "1/2 tsp turmeric", "1 tbsp lemon juice", "1 tbsp oil", "Salt to taste", "Bell peppers and onions (optional)"],
          instructions: ["Mix yogurt, spices, and lemon juice to make marinade", "Add paneer cubes and marinate for 30 minutes", "Thread onto skewers with vegetables if using", "Grill or bake at 200°C for 15-20 minutes", "Turn occasionally until golden and slightly charred", "Serve hot with mint chutney"]
        }
      },
      {
        name: "Vegetable Biryani",
        description: "Aromatic basmati rice cooked with mixed vegetables, spices, and herbs. A complete meal packed with nutrients.",
        emoji: "🍛",
        diet: "veg",
        dietLabel: "Vegetarian",
        calories: 450,
        plans: ["weight-gain", "muscle-building"],
      },
      {
        name: "Dal Makhani",
        description: "Creamy black lentils cooked with butter and spices. High protein, good for muscle building.",
        emoji: "🥘",
        diet: "veg",
        dietLabel: "Vegetarian",
        calories: 280,
        plans: ["muscle-building", "weight-gain"],
      },
      {
        name: "Vegetable Pulao",
        description: "Fragrant rice cooked with vegetables and whole spices. Balanced meal for weight maintenance.",
        emoji: "🍚",
        diet: "veg",
        dietLabel: "Vegetarian",
        calories: 380,
        plans: ["weight-gain", "muscle-building"],
      },
      {
        name: "Green Salad Bowl",
        description: "Fresh mixed greens with vegetables, nuts, and light dressing. Perfect for weight loss.",
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
        description: "Tender chicken breast marinated in herbs and spices, grilled to perfection. High in protein, low in fat.",
        emoji: "🍗",
        diet: "non-veg",
        dietLabel: "Non-Vegetarian",
        calories: 250,
        plans: ["weight-loss", "fat-loss", "muscle-building"],
        recipe: {
          ingredients: ["2 chicken breasts (200g each)", "2 tbsp olive oil", "2 cloves garlic, minced", "1 tsp dried oregano", "1 tsp paprika", "1/2 tsp black pepper", "1/2 tsp salt", "Lemon juice"],
          instructions: ["Mix olive oil, garlic, and all spices to make marinade", "Coat chicken breasts with marinade and refrigerate for 1 hour", "Preheat grill or pan to medium-high heat", "Grill chicken for 6-7 minutes per side", "Cook until internal temperature reaches 165°F", "Rest for 5 minutes, then slice and serve with lemon"]
        }
      },
      {
        name: "Prawn Stir Fry",
        description: "Fresh prawns stir-fried with vegetables, garlic, and ginger in a light sauce. Low calorie, high protein.",
        emoji: "🦐",
        diet: "non-veg",
        dietLabel: "Non-Vegetarian",
        calories: 200,
        plans: ["weight-loss", "fat-loss"],
      },
      {
        name: "Fish Curry",
        description: "Fresh fish cooked in a spicy coconut-based curry with aromatic spices. Omega-3 rich, good for fat loss.",
        emoji: "🐟",
        diet: "non-veg",
        dietLabel: "Non-Vegetarian",
        calories: 320,
        plans: ["fat-loss", "muscle-building"],
      },
      {
        name: "Mutton Biryani",
        description: "Fragrant basmati rice layered with tender mutton, spices, and fried onions. High calorie for weight gain.",
        emoji: "🍛",
        diet: "non-veg",
        dietLabel: "Non-Vegetarian",
        calories: 550,
        plans: ["weight-gain", "muscle-building"],
      },
      {
        name: "Chicken Tikka Masala",
        description: "Tender chicken pieces in a creamy tomato-based curry with aromatic spices. Protein-rich meal.",
        emoji: "🍗",
        diet: "non-veg",
        dietLabel: "Non-Vegetarian",
        calories: 420,
        plans: ["muscle-building", "weight-gain"],
      },
      {
        name: "Egg Curry",
        description: "Hard-boiled eggs in a spicy onion-tomato gravy, rich in protein. Perfect for muscle building.",
        emoji: "🥚",
        diet: "non-veg",
        dietLabel: "Non-Vegetarian",
        calories: 280,
        plans: ["muscle-building", "weight-gain", "fat-loss"],
      },
      {
        name: "Grilled Salmon",
        description: "Omega-3 rich salmon grilled with herbs. Excellent for fat loss and muscle building.",
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
        description: "Fresh chickpeas mixed with vegetables, herbs, and a lemon-olive oil dressing. Low calorie, high fiber.",
        emoji: "🥙",
        diet: "vegan",
        dietLabel: "Vegan",
        calories: 220,
        plans: ["weight-loss", "fat-loss"],
        recipe: {
          ingredients: ["2 cups cooked chickpeas", "1 cucumber, diced", "1 tomato, diced", "1/2 red onion, finely chopped", "1/4 cup fresh parsley, chopped", "2 tbsp olive oil", "2 tbsp lemon juice", "1 clove garlic, minced", "Salt and pepper to taste"],
          instructions: ["Rinse and drain chickpeas well", "Combine chickpeas with diced vegetables", "Whisk together olive oil, lemon juice, and garlic for dressing", "Pour dressing over salad and toss gently", "Add salt, pepper, and parsley", "Chill for 30 minutes before serving"]
        }
      },
      {
        name: "Lentil Curry",
        description: "Protein-rich red lentils cooked with tomatoes, onions, and aromatic spices. Great for muscle building.",
        emoji: "🍲",
        diet: "vegan",
        dietLabel: "Vegan",
        calories: 250,
        plans: ["muscle-building", "weight-gain", "fat-loss"],
      },
      {
        name: "Quinoa Buddha Bowl",
        description: "Nutritious quinoa topped with roasted vegetables, chickpeas, and tahini dressing. Complete protein source.",
        emoji: "🥗",
        diet: "vegan",
        dietLabel: "Vegan",
        calories: 380,
        plans: ["muscle-building", "weight-gain"],
      },
      {
        name: "Vegan Pad Thai",
        description: "Rice noodles stir-fried with tofu, vegetables, and a tangy tamarind sauce. High calorie for weight gain.",
        emoji: "🍜",
        diet: "vegan",
        dietLabel: "Vegan",
        calories: 420,
        plans: ["weight-gain", "muscle-building"],
      },
      {
        name: "Tofu Scramble",
        description: "Scrambled tofu with vegetables, turmeric, and spices - a protein-packed breakfast.",
        emoji: "🍳",
        diet: "vegan",
        dietLabel: "Vegan",
        calories: 200,
        plans: ["weight-loss", "fat-loss", "muscle-building"],
      },
      {
        name: "Vegan Pasta",
        description: "Whole wheat pasta with marinara sauce, vegetables, and nutritional yeast. Good for weight gain.",
        emoji: "🍝",
        diet: "vegan",
        dietLabel: "Vegan",
        calories: 350,
        plans: ["weight-gain", "muscle-building"],
      },
      {
        name: "Green Smoothie Bowl",
        description: "Nutrient-dense smoothie bowl with fruits, greens, and plant-based protein. Low calorie option.",
        emoji: "🥤",
        diet: "vegan",
        dietLabel: "Vegan",
        calories: 180,
        plans: ["weight-loss", "fat-loss"],
      },
    ],
  };

  const getPlanLabel = (plan) => {
    const labels = {
      "weight-loss": "Weight Loss",
      "weight-gain": "Weight Gain",
      "fat-loss": "Fat Loss",
      "muscle-building": "Muscle Building",
    };
    return labels[plan] || plan;
  };

  const baseMeals = allMeals[diet] || [];
  return baseMeals
    .filter((meal) => meal.plans && meal.plans.includes(plan))
    .map((meal) => ({
      ...meal,
      calories: meal.calories.toString(),
      planLabel: getPlanLabel(plan),
    }));
};

module.exports = { getMealsByDietAndPlan };
