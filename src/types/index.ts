export type PageView = 
  | 'signup' 
  | 'login' 
  | 'dashboard' 
  | 'fitness-form' 
  | 'my-plan' 
  | 'profile';

export interface UserSession {
  userId?: string;
  fullName: string;
  email: string;
  password?: string;
  createdAt?: string;
}

export type FitnessGoal = 'Muscle Gain' | 'Weight Loss' | 'General Fitness' | string;
export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | string;

export interface FitnessFormData {
  age?: string;
  height?: string;
  weight?: string;
  fitnessGoal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  workoutDays: string | number;
  availableEquipment?: string;
  foodPreference?: string;
}

// 1. Signup API Contract
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  message: string;
  user?: {
    name?: string;
    email?: string;
    password?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// 2. Login API Contract
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user?: {
    name?: string;
    email?: string;
    password?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// 3. Dashboard API Contract
export interface DashboardResponse {
  message: string;
  user?: {
    name?: string;
    email?: string;
    password?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// 4. Generate Fitness Plan API Contract
export interface GeneratePlanRequest {
  goal: string;
  experience: string;
  workout_days: number;
}

export interface GeneratePlanResponse {
  message: string;
  plan?: {
    goal?: string;
    experience?: string;
    workout_days?: number;
    planId?: string;
    userId?: string;
    planStatus?: string;
    workoutPlan?: any;
    mealSuggestions?: any;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface WorkoutDayPlan {
  day: string;
  focus: string;
  exercises: {
    name: string;
    sets: string | number;
    reps: string | number;
    rest?: string;
    tips?: string;
  }[];
}

export interface MealPlanDay {
  mealType: string;
  description: string;
  calories?: string | number;
  protein?: string;
}

export interface StructuredFitnessPlan {
  planId?: string;
  userId?: string;
  planStatus?: string;
  name?: string;
  goal?: string;
  experienceLevel?: string;
  workoutSchedule?: string;
  workout_days?: number | string;
  equipment?: string;
  foodPreference?: string;
  workoutPlan?: WorkoutDayPlan[] | string | any;
  weeklyWorkoutPlan?: WorkoutDayPlan[] | string | any;
  mealSuggestions?: MealPlanDay[] | string | any;
  dietPlan?: MealPlanDay[] | string | any;
  waterGoal?: string;
  importantNotes?: string[] | string;
  rawText?: string;
  generatedDate?: string;
  generatedAt?: string;
  [key: string]: any;
}
