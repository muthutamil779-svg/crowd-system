export type FreshnessStatus = 'use-soon' | 'check-food' | 'fresh' | 'past-date';

export type FoodCategory =
  | 'Vegetables'
  | 'Fruits'
  | 'Dairy'
  | 'Grains'
  | 'Spices'
  | 'Protein'
  | 'Other';

export type StorageType = 'Countertop' | 'Refrigerator' | 'Freezer' | 'Pantry';

export interface Ingredient {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  purchaseDate: string; // ISO date
  openedDate?: string;
  recordedExpiryDate?: string; // Optional manufacturer date
  estimatedShelfLifeDays: number; // AI estimated days
  freshnessStatus: FreshnessStatus;
  freshnessReason: string; // "Visible slight softening detected on skin", etc.
  storageType: StorageType;
  icon: string; // Emoji or SVG identifier
  estimatedGrams?: number;
  estimatedCostValue?: number; // Cost in INR ₹
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
  substituteOption?: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  image: string;
  icon: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  baseServings: number;
  prepTimeMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  cuisine: string;
  tags: string[];
  description: string;
}

export interface ScaledIngredient {
  name: string;
  originalQty: number;
  scaledQty: number;
  unit: string;
  inInventory: boolean;
  availableQty?: number;
  status?: FreshnessStatus;
}

export interface ScaledRecipe {
  recipe: Recipe;
  originalServings: number;
  scaledServings: number;
  ingredients: ScaledIngredient[];
  scaleFactor: number;
  wastePreventedScore: number;
  urgentIngredientsUsed: string[];
}

export interface Substitution {
  id: string;
  originalIngredient: string;
  substituteName: string;
  ratio: string; // e.g. "1 cup milk + 1 tbsp lemon juice = 1 cup buttermilk"
  culinaryReason: string;
  confidence: number; // 0 - 100%
  inventoryAvailable: boolean;
  components?: { name: string; quantity: number; unit: string }[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: FoodCategory;
  checked: boolean;
  reason: string; // e.g., "Needed for Tomato Egg Curry", "Low Stock"
  estimatedPrice: number; // in INR ₹
  addedAt: string;
}

export interface ImpactStats {
  foodWastePreventedKg: number;
  moneySaved: number; // in INR ₹
  ingredientsRescued: number;
  mealsCreated: number;
  shoppingTripsAvoided: number;
  sustainabilityScore: number; // 0 - 100
  history: {
    date: string;
    wastePreventedKg: number;
    moneySaved: number;
  }[];
}

export interface KitchenNotification {
  id: string;
  title: string;
  message: string;
  type: 'urgent' | 'warning' | 'info' | 'tip';
  recipeId?: string;
  ingredientId?: string;
  actionLabel?: string;
  actionRoute?: string;
  timestamp: string;
  read: boolean;
}

export interface DetectedFoodItem {
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  confidence: number;
  estimatedShelfLifeDays: number;
  freshnessStatus: FreshnessStatus;
  visualIndicators: string[];
  reason: string;
  storageRecommendation: StorageType;
  icon: string;
  estimatedCostValue: number;
}
