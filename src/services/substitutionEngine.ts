import { Substitution, Ingredient } from '../types';
import { culinarySubstitutions } from '../data/demoSubstitutions';

export interface SubstitutionMatchResult {
  substitution: Substitution;
  canFulfillWithInventory: boolean;
  missingComponents: string[];
}

export function findSubstitutionForIngredient(
  ingredientName: string,
  inventory: Ingredient[]
): SubstitutionMatchResult | null {
  const normName = ingredientName.toLowerCase().trim();

  const found = culinarySubstitutions.find((sub) =>
    sub.originalIngredient.toLowerCase().includes(normName) ||
    normName.includes(sub.originalIngredient.toLowerCase())
  );

  if (!found) return null;

  let canFulfill = true;
  const missingComponents: string[] = [];

  if (found.components && found.components.length > 0) {
    found.components.forEach((comp) => {
      const inStock = inventory.some(
        (inv) =>
          inv.name.toLowerCase().includes(comp.name.toLowerCase()) &&
          inv.quantity >= comp.quantity
      );
      if (!inStock) {
        canFulfill = false;
        missingComponents.push(comp.name);
      }
    });
  } else {
    // If no explicit component list, check substitute name
    const inStock = inventory.some((inv) =>
      found.substituteName.toLowerCase().includes(inv.name.toLowerCase())
    );
    canFulfill = inStock;
  }

  return {
    substitution: {
      ...found,
      inventoryAvailable: canFulfill
    },
    canFulfillWithInventory: canFulfill,
    missingComponents
  };
}
