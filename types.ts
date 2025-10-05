export enum Feature {
  RECIPE_GENERATOR = 'recipe-generator',
  NUTRITIONAL_ANALYZER = 'nutritional-analyzer',
  LEFTOVER_RECOMMENDER = 'leftover-recommender',
  MEDICAL_DIETARY_PLANNER = 'medical-dietary-planner',
  PERSONALIZED_DIETARY_PLANNER = 'personalized-dietary-planner',
  USER_PREFERENCES = 'user-preferences',
}

export enum MedicalCondition {
  NONE = 'none',
  TYPE_2_DIABETES = 'type-2-diabetes',
  HYPERTENSION = 'hypertension',
  CELIAC_DISEASE = 'celiac-disease',
  HIGH_CHOLESTEROL = 'high-cholesterol',
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
  favoriteCuisines: string[];
  dailyCalorieGoal: number | string;
  healthGoals: string[];
  otherHealthGoals: string;
  budget: string;
}

export interface User {
  email: string;
  password: string; // In a real app, this would be a hash
  preferences: UserPreferences;
}

export interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: string;
  imagePrompt: string;
}

export interface NutritionInfo {
  mealName: string;
  calories: {
    total: number;
    perServing: number;
  };
  macros: {
    protein: string;
    carbohydrates: string;
    fat: string;
  };
  vitamins: { name: string; amount: string; }[];
  minerals: { name: string; amount: string; }[];
}

export interface DietaryPlan {
  condition: string;
  foodsToFavor: string[];
  foodsToAvoid: string[];
  guidelines: string;
  recipes: Recipe[];
}

export interface PersonalizedPlan {
  title: string;
  summary: string;
  days: {
    day: string; // e.g., "Monday" or "Day 1"
    meals: {
      name: string; // "Breakfast", "Lunch", "Dinner", "Snack"
      recipe: { // This is now a summary
        title: string;
        description: string;
      };
    }[];
    dailyTotals: {
      calories: number;
      protein: string;
      carbs: string;
      fat: string;
    };
  }[];
}