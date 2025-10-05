import { GoogleGenAI, Type } from '@google/genai';
import { Feature, MedicalCondition, Recipe, NutritionInfo, UserPreferences } from '../types';

let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not set. Please create env.js and configure your Gemini API key.");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}

const buildPreferenceString = (preferences: UserPreferences): string => {
  const preferenceParts: string[] = [];
  if (preferences.dietaryRestrictions?.length > 0) {
    preferenceParts.push(`Dietary Restrictions: ${preferences.dietaryRestrictions.join(', ')}.`);
  }
  if (preferences.allergies?.length > 0) {
    preferenceParts.push(`The user is allergic to the following and these ingredients MUST BE AVOIDED: ${preferences.allergies.join(', ')}.`);
  }
  if (preferences.favoriteCuisines?.length > 0) {
    preferenceParts.push(`Favorite Cuisines: ${preferences.favoriteCuisines.join(', ')}.`);
  }
  if (preferences.dailyCalorieGoal) {
    preferenceParts.push(`Approximate daily calorie goal: ${preferences.dailyCalorieGoal} kcal.`);
  }
  
  const allHealthGoals = [...(preferences.healthGoals || [])];
  if (preferences.otherHealthGoals && preferences.otherHealthGoals.trim()) {
      allHealthGoals.push(preferences.otherHealthGoals.trim());
  }
  if (allHealthGoals.length > 0) {
   preferenceParts.push(`Health Goals: ${allHealthGoals.join(', ')}.`);
  }

  if (preferences.budget) {
    preferenceParts.push(`The recipes should be ${preferences.budget}.`);
  }

  if (preferenceParts.length === 0) {
    return 'The user has no specific preferences set.';
  } else {
    return `The user has the following preferences, which you must adhere to: ${preferenceParts.join(' ')}`;
  }
}

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'The creative and appealing name of the recipe.' },
        description: { type: Type.STRING, description: 'A short, enticing description of the dish.' },
        ingredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of all ingredients with quantities.' },
        instructions: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Step-by-step cooking instructions.' },
        prepTime: { type: Type.STRING, description: 'Estimated preparation time (e.g., "15 minutes").' },
        cookTime: { type: Type.STRING, description: 'Estimated cooking time (e.g., "30 minutes").' },
        servings: { type: Type.STRING, description: 'Number of servings the recipe makes (e.g., "4 servings").' },
        imagePrompt: { type: Type.STRING, description: 'A detailed, descriptive prompt for an AI image generator to create a visually appealing photo of the final dish. Example: "A close-up of a golden-brown roasted chicken, glistening with herbs, on a rustic wooden platter, surrounded by roasted root vegetables."' },
    },
    required: ['title', 'description', 'ingredients', 'instructions', 'prepTime', 'cookTime', 'servings', 'imagePrompt'],
};

const personalizedPlanSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "The overall title of the dietary plan, reflecting the user's goals." },
        summary: { type: Type.STRING, description: "A brief summary of the plan's focus and benefits." },
        days: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.STRING, description: "The day of the plan (e.g., 'Monday', 'Day 1')." },
                    meals: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "The name of the meal (e.g., 'Breakfast', 'Lunch')." },
                                recipe: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING, description: 'The creative and appealing name of the recipe.' },
                                        description: { type: Type.STRING, description: 'A short, enticing description of the dish to show in the plan overview.' },
                                    },
                                    required: ['title', 'description'],
                                },
                            },
                             required: ['name', 'recipe'],
                        },
                    },
                    dailyTotals: {
                        type: Type.OBJECT,
                        properties: {
                            calories: { type: Type.NUMBER },
                            protein: { type: Type.STRING, description: "e.g., '120g'" },
                            carbs: { type: Type.STRING, description: "e.g., '150g'" },
                            fat: { type: Type.STRING, description: "e.g., '60g'" },
                        },
                        required: ['calories', 'protein', 'carbs', 'fat'],
                    }
                },
                required: ['day', 'meals', 'dailyTotals'],
            }
        }
    },
    required: ['title', 'summary', 'days'],
};

const getPromptAndSchema = (feature: Feature, textInput: string, condition: MedicalCondition, preferences: UserPreferences, planDuration?: 'Daily' | 'Weekly' | 'Monthly') => {
  const imageInstruction = "If an image is provided, analyze the meal in the image. Combine this with any text description. Prioritize the image content.";
  const recipeImagePromptInstruction = "For each recipe, also provide a detailed, descriptive `imagePrompt` suitable for an AI image generator to create a visually appealing photo of the final dish.";
  
  const preferenceString = buildPreferenceString(preferences);

  switch (feature) {
    case Feature.RECIPE_GENERATOR:
      return {
        prompt: `Generate 3-4 diverse and creative recipes from the following available ingredients: ${textInput}. Ensure a variety of cuisines, including a mix of Indian and South Indian recipes. The recipes should be suitable for a home cook. ${preferenceString} ${recipeImagePromptInstruction}`,
        schema: { type: Type.OBJECT, properties: { recipes: { type: Type.ARRAY, items: recipeSchema } } },
      };

    case Feature.LEFTOVER_RECOMMENDER:
      return {
        prompt: `I have some leftovers. Here's what I have: ${textInput}. Suggest 2-3 creative new meals to avoid food waste. Ensure a variety of cuisines, including a mix of Indian and South Indian recipes if possible with the ingredients. ${preferenceString} ${recipeImagePromptInstruction}`,
        schema: { type: Type.OBJECT, properties: { recipes: { type: Type.ARRAY, items: recipeSchema } } },
      };

    case Feature.NUTRITIONAL_ANALYZER:
      return {
        prompt: `Analyze the nutritional content of the meal or ingredients. ${imageInstruction} Here's the description: ${textInput}. Provide a detailed breakdown.`,
        schema: {
          type: Type.OBJECT,
          properties: {
            mealName: { type: Type.STRING, description: "A descriptive name for the meal analyzed." },
            calories: { type: Type.OBJECT, properties: { total: { type: Type.NUMBER }, perServing: { type: Type.NUMBER } } },
            macros: { type: Type.OBJECT, properties: { protein: { type: Type.STRING }, carbohydrates: { type: Type.STRING }, fat: { type: Type.STRING } } },
            vitamins: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, amount: { type: Type.STRING } } } },
            minerals: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, amount: { type: Type.STRING } } } },
          },
        },
      };

    case Feature.MEDICAL_DIETARY_PLANNER:
      const conditionMap = {
        [MedicalCondition.TYPE_2_DIABETES]: "Type 2 Diabetes",
        [MedicalCondition.HYPERTENSION]: "Hypertension",
        [MedicalCondition.CELIAC_DISEASE]: "Celiac Disease (Gluten-Free)",
        [MedicalCondition.HIGH_CHOLESTEROL]: "High Cholesterol",
        [MedicalCondition.NONE]: "General Health"
      }
      return {
        prompt: `Act as a registered dietitian. A user with ${conditionMap[condition]} has the following ingredients: ${textInput}. 
        1. Provide "Foods to Favor" and "Foods to Avoid" for their condition.
        2. Give key dietary guidelines.
        3. Generate 2-3 recipes suitable for them using their ingredients, strictly adhering to their dietary needs (${conditionMap[condition]}). Include a variety of cuisines, such as a mix of Indian and South Indian dishes if possible. ${preferenceString} ${recipeImagePromptInstruction}`,
        schema: {
          type: Type.OBJECT,
          properties: {
            condition: { type: Type.STRING }, foodsToFavor: { type: Type.ARRAY, items: { type: Type.STRING } },
            foodsToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } }, guidelines: { type: Type.STRING },
            recipes: { type: Type.ARRAY, items: recipeSchema },
          },
        },
      };
    
    case Feature.PERSONALIZED_DIETARY_PLANNER:
      return {
        prompt: `Act as an expert nutritionist. Create a comprehensive ${planDuration} dietary plan for a user based on their specific preferences.
        The plan should be creative, delicious, and easy to follow for a home cook.
        
        **User Preferences (You MUST adhere to all of these):**
        ${preferenceString}

        **Your Task:**
        1.  Generate a complete ${planDuration} meal plan. For each day, provide meals for Breakfast, Lunch, and Dinner. You can optionally add 1-2 healthy snacks.
        2.  For EVERY meal, provide just a creative \`title\` and a short, enticing \`description\`. DO NOT generate the full recipe (ingredients, instructions, etc.) in this initial plan. The full recipe will be requested later.
        3.  Ensure the meal titles are diverse and align with the user's favorite cuisines.
        4.  Calculate and provide the estimated total calories, protein, carbs, and fat for each day.
        5.  The plan's title and summary should reflect the user's main health goals.
        6.  Strictly avoid any ingredients the user is allergic to.
        7.  Adhere to all dietary restrictions mentioned.
        `,
        schema: personalizedPlanSchema,
      };
      
    case Feature.USER_PREFERENCES:
      throw new Error("This feature does not generate content directly.");

    default:
      throw new Error('Invalid feature selected.');
  }
};

export const identifyIngredients = async (imageBase64: string): Promise<{ ingredients: string }> => {
  const aiClient = getAiClient();
  const prompt = "Analyze the provided image and identify all the food ingredients present. List them as a single, comma-separated string. Be concise and accurate.";
  const schema = {
    type: Type.OBJECT,
    properties: {
      ingredients: {
        type: Type.STRING,
        description: "A comma-separated list of ingredients identified in the image."
      }
    }
  };
  const parts = [
    { text: prompt },
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    },
  ];

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error identifying ingredients from Gemini:", error);
    throw new Error("Failed to identify ingredients from the image.");
  }
};

export const generateRecipesStream = async (
    feature: Feature, 
    textInput: string, 
    condition: MedicalCondition, 
    preferences: UserPreferences,
    onComplete: (recipes: Recipe[]) => void
): Promise<void> => {
    const aiClient = getAiClient();
    const { prompt, schema } = getPromptAndSchema(feature, textInput, condition, preferences);

    try {
        const stream = await aiClient.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        let buffer = '';
        for await (const chunk of stream) {
            buffer += chunk.text;
        }
        
        const result = JSON.parse(buffer);
        onComplete(result.recipes || []);

    } catch (error) {
        console.error("Error streaming recipes from Gemini:", error);
        throw new Error("Failed to stream recipes from AI.");
    }
};


export const generateContent = async (feature: Feature, textInput: string, condition: MedicalCondition, imageBase64: string | null, preferences: UserPreferences, planDuration?: 'Daily' | 'Weekly' | 'Monthly'): Promise<any> => {
  const aiClient = getAiClient();
  const { prompt, schema } = getPromptAndSchema(feature, textInput, condition, preferences, planDuration);
  
  const parts: any[] = [{ text: prompt }];

  const featuresThatUseImageDirectly = [Feature.NUTRITIONAL_ANALYZER];
  if (imageBase64 && featuresThatUseImageDirectly.includes(feature)) {
    parts.unshift({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    });
  }

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    throw new Error("Failed to parse response from AI.");
  }
};

export const generateRecipeForPlan = async (mealTitle: string, mealDescription: string, preferences: UserPreferences): Promise<Recipe> => {
    const aiClient = getAiClient();
    const preferenceString = buildPreferenceString(preferences);

    const prompt = `Generate a complete recipe for a dish titled "${mealTitle}".
    The dish is described as: "${mealDescription}".
    The recipe should be suitable for a home cook and must follow all the user's preferences.
    
    **User Preferences:**
    ${preferenceString}
    
    Generate the full recipe details: title, description, ingredients, instructions, prep time, cook time, servings, and a visually descriptive image prompt for an AI image generator. The title and description you generate in the recipe must match the input title and description.`;

    try {
        const response = await aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating recipe for plan from Gemini:", error);
        throw new Error("Failed to generate the full recipe.");
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    const aiClient = getAiClient();
    try {
      const response = await aiClient.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
        },
      });
  
      if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
      } else {
        throw new Error("No image was generated by the API.");
      }
    } catch (error) {
      console.error("Error generating image from Gemini:", error);
      throw new Error("Failed to generate image.");
    }
  };

export const generateNutritionForRecipe = async (recipe: Recipe): Promise<NutritionInfo> => {
    const aiClient = getAiClient();
    const ingredientsString = recipe.ingredients.join(', ');
    const prompt = `Analyze the nutritional content of the following recipe: "${recipe.title}". The recipe serves ${recipe.servings}. Ingredients: ${ingredientsString}. Provide a detailed breakdown including total calories, calories per serving, macronutrients (protein, carbohydrates, fat in grams), and a list of 5 key vitamins and 5 key minerals with their amounts.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
          mealName: { type: Type.STRING, description: "The name of the recipe being analyzed." },
          calories: { type: Type.OBJECT, properties: { total: { type: Type.NUMBER }, perServing: { type: Type.NUMBER } } },
          macros: { type: Type.OBJECT, properties: { protein: { type: Type.STRING, description: "e.g., '25g'" }, carbohydrates: { type: Type.STRING, description: "e.g., '40g'" }, fat: { type: Type.STRING, description: "e.g., '15g'" } } },
          vitamins: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, amount: { type: Type.STRING } } }, description: "List of 5 key vitamins." },
          minerals: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, amount: { type: Type.STRING } } }, description: "List of 5 key minerals." },
        },
      };

    try {
        const response = await aiClient.models.generateContent({
          model: "gemini-2.5-flash",
          contents: { parts: [{ text: prompt }] },
          config: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        });
    
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
      } catch (error) {
        console.error("Error generating nutrition from Gemini:", error);
        throw new Error("Failed to generate nutritional information for the recipe.");
      }
}