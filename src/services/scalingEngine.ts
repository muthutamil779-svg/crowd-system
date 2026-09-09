import { Recipe, Ingredient, ScaledRecipe, ScaledIngredient } from '../types';

export interface OptimalScaleFit {
  recommendedServings: number;
  limitingIngredientName: string;
  limitingAvailableQty: number;
  limitingUnit: string;
  reason: string;
}

/**
 * Calculates the optimal zero-waste serving size based on the quantities
 * of ingredients currently in the inventory, especially those that are 'use-soon'.
 */
export function calculateOptimalZeroWasteFit(
  recipe: Recipe,
  inventory: Ingredient[]
): OptimalScaleFit | null {
  let minRatio = Infinity;
  let limitingIng: { name: string; available: number; unit: string } | null = null;

  for (const recIng of recipe.ingredients) {
    if (recIng.optional) continue;

    const matched = inventory.find(
      (inv) =>
        inv.name.toLowerCase().includes(recIng.name.toLowerCase()) ||
        recIng.name.toLowerCase().includes(inv.name.toLowerCase())
    );

    if (matched && matched.quantity > 0) {
      const ratio = matched.quantity / recIng.quantity;
      // Prioritize urgent ingredients as constraints
      const urgencyBoost = matched.freshnessStatus === 'use-soon' ? 0.9 : 1.0;
      if (ratio * urgencyBoost < minRatio) {
        minRatio = ratio;
        limitingIng = {
          name: matched.name,
          available: matched.quantity,
          unit: matched.unit
        };
      }
    }
  }

  if (!limitingIng || minRatio === Infinity) {
    return null;
  }

  // Calculate servings based on the limiting ingredient, rounded to nearest 0.5 or integer
  const suggestedServings = Math.max(1, Math.round(recipe.baseServings * minRatio * 2) / 2);

  return {
    recommendedServings: suggestedServings,
    limitingIngredientName: limitingIng.name,
    limitingAvailableQty: limitingIng.available,
    limitingUnit: limitingIng.unit,
    reason: `Calibrated to consume all ${limitingIng.available} ${limitingIng.unit} of ${limitingIng.name} without leftovers.`
  };
}

/**
 * Scales a recipe's ingredient list up or down to targetServings.
 */
export function scaleRecipe(
  recipe: Recipe,
  targetServings: number,
  inventory: Ingredient[]
): ScaledRecipe {
  const scaleFactor = targetServings / recipe.baseServings;
  const urgentUsed: string[] = [];
  let wastePrevented = 0;

  const scaledIngredients: ScaledIngredient[] = recipe.ingredients.map((ing) => {
    const originalQty = ing.quantity;
    const scaledQty = Math.round(originalQty * scaleFactor * 100) / 100;

    const matched = inventory.find(
      (inv) =>
        inv.name.toLowerCase().includes(ing.name.toLowerCase()) ||
        ing.name.toLowerCase().includes(inv.name.toLowerCase())
    );

    const inInventory = !!(matched && matched.quantity > 0);
    const status = matched?.freshnessStatus;

    if (matched && (status === 'use-soon' || status === 'check-food')) {
      urgentUsed.push(matched.name);
      wastePrevented += 40;
    }

    return {
      name: ing.name,
      originalQty,
      scaledQty,
      unit: ing.unit,
      inInventory,
      availableQty: matched?.quantity,
      status
    };
  });

  return {
    recipe,
    originalServings: recipe.baseServings,
    scaledServings: targetServings,
    ingredients: scaledIngredients,
    scaleFactor,
    wastePreventedScore: wastePrevented,
    urgentIngredientsUsed: Array.from(new Set(urgentUsed))
  };
}
