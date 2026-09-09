import { Ingredient, Recipe, FreshnessStatus } from '../types';

export interface RecipeWasteAnalysis {
  recipe: Recipe;
  totalScore: number;
  coveragePercent: number;
  matchingIngredients: {
    name: string;
    inventoryQty: number;
    requiredQty: number;
    unit: string;
    status: FreshnessStatus;
  }[];
  missingIngredients: {
    name: string;
    requiredQty: number;
    unit: string;
    hasSubstitute: boolean;
  }[];
  urgentIngredientsUsed: string[];
  wastePreventedGrams: number;
  wastePreventedCost: number;
  priorityLevel: 'Urgent' | 'High' | 'Medium' | 'Standard';
  whyRecommended: string;
}

export function rankRecipesByExpiryPriority(
  recipes: Recipe[],
  inventory: Ingredient[]
): RecipeWasteAnalysis[] {
  const analyses = recipes.map((recipe) => {
    let score = 0;
    const matching: RecipeWasteAnalysis['matchingIngredients'] = [];
    const missing: RecipeWasteAnalysis['missingIngredients'] = [];
    const urgentItems: string[] = [];
    let wasteGrams = 0;
    let wasteCost = 0;

    const coreIngredients = recipe.ingredients.filter((i) => !i.optional);

    recipe.ingredients.forEach((recIng) => {
      // Find matching ingredient in inventory (case insensitive partial matching)
      const matched = inventory.find((inv) =>
        inv.name.toLowerCase().includes(recIng.name.toLowerCase()) ||
        recIng.name.toLowerCase().includes(inv.name.toLowerCase())
      );

      if (matched && matched.quantity > 0) {
        matching.push({
          name: recIng.name,
          inventoryQty: matched.quantity,
          requiredQty: recIng.quantity,
          unit: recIng.unit,
          status: matched.freshnessStatus
        });

        // Expiry priority weighting
        if (matched.freshnessStatus === 'use-soon') {
          score += 60;
          urgentItems.push(matched.name);
          wasteGrams += matched.estimatedGrams || 150;
          wasteCost += matched.estimatedCostValue || 30;
        } else if (matched.freshnessStatus === 'check-food') {
          score += 35;
          urgentItems.push(matched.name);
          wasteGrams += (matched.estimatedGrams || 150) * 0.7;
          wasteCost += (matched.estimatedCostValue || 30) * 0.7;
        } else if (matched.freshnessStatus === 'fresh') {
          score += 15;
        }
      } else if (!recIng.optional) {
        missing.push({
          name: recIng.name,
          requiredQty: recIng.quantity,
          unit: recIng.unit,
          hasSubstitute: !!recIng.substituteOption
        });
      }
    });

    const coveragePercent = coreIngredients.length > 0
      ? Math.round((matching.length / coreIngredients.length) * 100)
      : 100;

    // Weight total score by coverage
    const coverageFactor = Math.min(1, (matching.length + 0.5) / (coreIngredients.length || 1));
    const totalScore = Math.round(score * coverageFactor * 10) / 10;

    let priorityLevel: RecipeWasteAnalysis['priorityLevel'] = 'Standard';
    let whyRecommended = 'Balanced pantry recipe.';

    if (urgentItems.length >= 2) {
      priorityLevel = 'Urgent';
      whyRecommended = `Rescues ${urgentItems.join(' and ')} before expiration!`;
    } else if (urgentItems.length === 1) {
      priorityLevel = 'High';
      whyRecommended = `Uses urgent ${urgentItems[0]} with high pantry coverage.`;
    } else if (coveragePercent >= 75) {
      priorityLevel = 'Medium';
      whyRecommended = `${coveragePercent}% of ingredients already available in your kitchen.`;
    }

    return {
      recipe,
      totalScore,
      coveragePercent,
      matchingIngredients: matching,
      missingIngredients: missing,
      urgentIngredientsUsed: urgentItems,
      wastePreventedGrams: Math.round(wasteGrams),
      wastePreventedCost: Math.round(wasteCost),
      priorityLevel,
      whyRecommended
    };
  });

  // Sort descending by priority score
  return analyses.sort((a, b) => b.totalScore - a.totalScore);
}
