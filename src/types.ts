export interface UserProfile {
  // Basic Information
  fullName: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  location: string;

  // Medical Information
  existingConditions: string;
  currentMedications: string;
  recentSymptoms: string;
  familyHistory: string;

  // Dietary Preferences
  foodType: 'Vegetarian' | 'Non-Vegetarian' | 'Eggetarian' | '';
  cuisinePreference: string;
  allergies: string;
  dislikedFoods: string;
  eatingPattern: string;

  // Lifestyle Details
  maritalStatus: string;
  kids: string;
  occupation: string;
  sleepPattern: string;
  stressLevel: 'Low' | 'Moderate' | 'High' | '';

  // Fitness Information
  activityLevel: 'Sedentary' | 'Moderate' | 'Active' | '';
  exerciseExperience: 'Beginner' | 'Intermediate' | 'Advanced' | '';
  limitations: string;
}

export interface Meal {
  name: string;
  description: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface DayPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: Meal;
}

export interface Exercise {
  type: string;
  duration: string;
  frequency: string;
  instructions: string;
}

export interface HealthPlan {
  summary: {
    interpretation: string;
    riskAreas: string[];
    constraints: string[];
  };
  mealPlan: DayPlan[];
  exercisePlan: Exercise[];
  medicalDisclaimer?: string;
  requiresConsultation: boolean;
  consultationReason?: string;
}
