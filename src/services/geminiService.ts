import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, HealthPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generateHealthPlan(profile: UserProfile): Promise<HealthPlan> {
  const model = "gemini-3.1-pro-preview";
  
  // Sanitize inputs: treat empty or space-only strings as "None" or "Normal"
  const sanitize = (val: string) => (val?.trim() === "" ? "None/Normal" : val.trim());
  
  const sanitizedProfile = {
    ...profile,
    existingConditions: sanitize(profile.existingConditions),
    currentMedications: sanitize(profile.currentMedications),
    recentSymptoms: sanitize(profile.recentSymptoms),
    familyHistory: sanitize(profile.familyHistory),
    allergies: sanitize(profile.allergies),
    dislikedFoods: sanitize(profile.dislikedFoods),
    limitations: sanitize(profile.limitations),
  };

  const prompt = `
    You are an expert Health & Nutrition Assistant. Generate a highly personalized weekly health plan for the following user:
    
    User Profile:
    - Name: ${sanitizedProfile.fullName}
    - Age: ${sanitizedProfile.age}
    - Gender: ${sanitizedProfile.gender}
    - Height: ${sanitizedProfile.height}
    - Weight: ${sanitizedProfile.weight}
    - Location: ${sanitizedProfile.location}
    - Medical Conditions: ${sanitizedProfile.existingConditions}
    - Medications: ${sanitizedProfile.currentMedications}
    - Recent Symptoms: ${sanitizedProfile.recentSymptoms}
    - Family History: ${sanitizedProfile.familyHistory}
    - Food Type: ${sanitizedProfile.foodType}
    - Cuisine: ${sanitizedProfile.cuisinePreference}
    - Allergies: ${sanitizedProfile.allergies}
    - Dislikes: ${sanitizedProfile.dislikedFoods}
    - Eating Pattern: ${sanitizedProfile.eatingPattern}
    - Marital Status: ${sanitizedProfile.maritalStatus}
    - Kids: ${sanitizedProfile.kids}
    - Occupation: ${sanitizedProfile.occupation}
    - Sleep: ${sanitizedProfile.sleepPattern}
    - Stress: ${sanitizedProfile.stressLevel}
    - Activity Level: ${sanitizedProfile.activityLevel}
    - Experience: ${sanitizedProfile.exerciseExperience}
    - Limitations: ${sanitizedProfile.limitations}

    Requirements:
    1. Provide a concise Health Summary (interpretation, risks, constraints).
    2. Generate a 7-day Weekly Meal Plan (Breakfast, Lunch, Dinner, Snacks).
    3. Use locally available foods based on the user's location (${sanitizedProfile.location}).
    4. Respect all medical conditions, preferences, and allergies.
    5. Provide specific dish names, not generic advice.
    6. Generate a tailored Exercise Plan (type, duration, frequency, instructions).
    7. Flag if professional medical consultation is required (e.g., uncontrolled diabetes, severe symptoms).
    8. Include a Medical Disclaimer if chronic illness or high risk is detected.
    9. For each meal, provide a short 'imagePrompt' that can be used to generate a realistic food image.

    Output MUST be in JSON format matching the HealthPlan interface.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.OBJECT,
            properties: {
              interpretation: { type: Type.STRING },
              riskAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
              constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["interpretation", "riskAreas", "constraints"],
          },
          mealPlan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                breakfast: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    imagePrompt: { type: Type.STRING },
                  },
                  required: ["name", "description", "imagePrompt"],
                },
                lunch: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    imagePrompt: { type: Type.STRING },
                  },
                  required: ["name", "description", "imagePrompt"],
                },
                dinner: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    imagePrompt: { type: Type.STRING },
                  },
                  required: ["name", "description", "imagePrompt"],
                },
                snacks: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    imagePrompt: { type: Type.STRING },
                  },
                  required: ["name", "description", "imagePrompt"],
                },
              },
              required: ["day", "breakfast", "lunch", "dinner", "snacks"],
            },
          },
          exercisePlan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                duration: { type: Type.STRING },
                frequency: { type: Type.STRING },
                instructions: { type: Type.STRING },
              },
              required: ["type", "duration", "frequency", "instructions"],
            },
          },
          medicalDisclaimer: { type: Type.STRING },
          requiresConsultation: { type: Type.BOOLEAN },
          consultationReason: { type: Type.STRING },
        },
        required: ["summary", "mealPlan", "exercisePlan", "requiresConsultation"],
      },
    },
  });

  return JSON.parse(response.text);
}

export async function generateFoodImage(prompt: string): Promise<string> {
  const model = "gemini-2.5-flash-image";
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          text: `A high-quality, realistic, appetizing food photography of: ${prompt}. Clean background, professional lighting.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  return ""; // Fallback
}
