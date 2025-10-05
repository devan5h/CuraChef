import { Feature, MedicalCondition } from './types';

export const FEATURES = [
  { 
    id: Feature.RECIPE_GENERATOR,
    title: 'Recipe Generator',
    icon: 'fa-solid fa-utensils',
    description: 'Enter your available ingredients, and our AI will suggest delicious recipes, helping you minimize food waste.',
    buttonText: 'Generate Recipes'
  },
  { 
    id: Feature.NUTRITIONAL_ANALYZER,
    title: 'Nutritional Analyzer',
    icon: 'fa-solid fa-chart-pie',
    description: 'Describe a meal or list its ingredients to get a detailed breakdown of calories, macros, vitamins, and minerals.',
    buttonText: 'Analyze Nutrition'
  },
  { 
    id: Feature.LEFTOVER_RECOMMENDER,
    title: 'Leftover Recommender',
    icon: 'fa-solid fa-recycle',
    description: 'Don\'t let leftovers go to waste! Tell us what you have, and we\'ll suggest creative new meals to make from them.',
    buttonText: 'Find Recommendations'
  },
  { 
    id: Feature.MEDICAL_DIETARY_PLANNER,
    title: 'Medical Dietary Planner',
    icon: 'fa-solid fa-heart-pulse',
    description: 'Select a medical condition to receive curated recipes and dietary guidelines that align with your specific health needs.',
    buttonText: 'Create Dietary Plan'
  },
  {
    id: Feature.PERSONALIZED_DIETARY_PLANNER,
    title: 'Personalized Dietary Plan',
    icon: 'fa-solid fa-calendar-days',
    description: 'Get a daily, weekly, or monthly meal plan tailored to your health goals, dietary needs, and preferences.',
  },
  { 
    id: Feature.USER_PREFERENCES,
    title: 'My Preferences',
    icon: 'fa-solid fa-user-gear',
    description: 'Set your dietary preferences, favorite cuisines, and health goals to get recipes tailored just for you.',
  },
];

export const MEDICAL_CONDITIONS = [
  { value: MedicalCondition.NONE, label: 'Select a Condition' },
  { value: MedicalCondition.TYPE_2_DIABETES, label: 'Type 2 Diabetes' },
  { value: MedicalCondition.HYPERTENSION, label: 'Hypertension' },
  { value: MedicalCondition.CELIAC_DISEASE, label: 'Celiac Disease' },
  { value: MedicalCondition.HIGH_CHOLESTEROL, label: 'High Cholesterol' },
];

export const DIETARY_RESTRICTIONS = ['Non-Vegetarian', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Low-Carb'];
export const ALLERGIES = ['Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish', 'Sesame'];
export const CUISINE_CHOICES = ['Italian', 'Mexican', 'Indian', 'Chinese', 'Thai', 'Mediterranean', 'Japanese', 'American'];
export const HEALTH_GOALS = ['Weight Loss', 'Muscle Gain', 'Heart Health', 'Improved Energy', 'Digestive Health', 'Stress Reduction', 'General Wellness'];
export const BUDGET_OPTIONS = [
  { value: 'budget-friendly', label: 'Budget-Friendly' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'premium', label: 'Premium' }
];