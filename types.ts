export interface MacroData {
  calories: number;
  fat: number;
  protein: number;
  carbs: number;
  netCarbs: number;
}

export interface FoodItem extends MacroData {
  name: string;
  quantity: string;
}

export interface MealAnalysis {
  foods: FoodItem[];
  total: MacroData;
  ketoAdvice: string;
  isKetoFriendly: boolean;
}

export interface DietRecord {
  id: string;
  userEmail: string; // Foreign Key for DB
  timestamp: number;
  analysis: MealAnalysis;
}

export interface HealthMeasurement {
  id: string;
  userEmail: string;
  timestamp: number;
  glucose: number; // mmol/L
  ketones: number; // mmol/L
  notes?: string;
}

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type DietGoal = 'lose' | 'maintain' | 'gain';

export interface UserProfile {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: Gender;
  activity: ActivityLevel;
  goal: DietGoal;
  bodyFat?: number; // optional %
  calculatedTargets?: MacroData; // Stores the calculated daily goals
}

export interface User {
  username: string;
  email: string;
  password?: string; // Stored locally for this demo (unsafe for production!)
  createdAt: number;
  profile?: UserProfile;
}

export enum ToolType {
  PEN = 'PEN',
  ERASER = 'ERASER',
}

export enum PenColor {
  BLACK = '#1e293b',
  RED = '#ef4444',
  BLUE = '#3b82f6',
  GREEN = '#10b981',
  PURPLE = '#8b5cf6',
}

export enum StrokeWidth {
  THIN = 2,
  MEDIUM = 5,
  THICK = 10,
}

export interface GeminiAnalysisResult {
  title: string;
  description: string;
  creativeSuggestion: string;
}