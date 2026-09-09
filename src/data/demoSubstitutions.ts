import { Substitution } from '../types';

export const culinarySubstitutions: Substitution[] = [
  {
    id: 'sub-buttermilk',
    originalIngredient: 'Buttermilk',
    substituteName: 'Milk + Lemon Juice',
    ratio: '1 cup Milk + 1 tbsp fresh Lemon Juice (rest for 5 mins)',
    culinaryReason: 'The citric acid curds the milk proteins, delivering identical tanginess and batter fluffiness.',
    confidence: 96,
    inventoryAvailable: true,
    components: [
      { name: 'Milk', quantity: 1, unit: 'cup' },
      { name: 'Lemon', quantity: 0.5, unit: 'pcs' }
    ]
  },
  {
    id: 'sub-spinach',
    originalIngredient: 'Spinach',
    substituteName: 'Methi Leaves / Mustard Greens / Kale',
    ratio: '1:1 ratio equal volume',
    culinaryReason: 'Cooked dark leafy greens share similar moisture levels and nutritional earthy profile.',
    confidence: 90,
    inventoryAvailable: false
  },
  {
    id: 'sub-lemon',
    originalIngredient: 'Lemon Juice',
    substituteName: 'Apple Cider / White Vinegar or Amchur (Dry Mango Powder)',
    ratio: '1/2 tsp Vinegar per 1 tsp Lemon Juice',
    culinaryReason: 'Provides clean acidity for balancing rich curries or marinades without altering texture.',
    confidence: 88,
    inventoryAvailable: false
  },
  {
    id: 'sub-heavycream',
    originalIngredient: 'Heavy Cream',
    substituteName: 'Whole Milk + Melted Butter',
    ratio: '3/4 cup Milk + 1/4 cup Melted Butter',
    culinaryReason: 'Restores the 36% milk-fat richness needed for silky pasta and gravies.',
    confidence: 92,
    inventoryAvailable: false
  },
  {
    id: 'sub-egg-baking',
    originalIngredient: 'Egg (Binding/Baking)',
    substituteName: 'Mashed Ripe Banana',
    ratio: '1/2 ripe banana per 1 egg',
    culinaryReason: 'Ripe banana starches bind flour and add natural moisture and sweetness in pancakes and quick breads.',
    confidence: 94,
    inventoryAvailable: true,
    components: [
      { name: 'Banana', quantity: 0.5, unit: 'pcs' }
    ]
  },
  {
    id: 'sub-sourcream',
    originalIngredient: 'Sour Cream',
    substituteName: 'Plain Thick Curd / Greek Yogurt',
    ratio: '1:1 direct swap',
    culinaryReason: 'Fermented lactic acid cultures provide identical creaminess and tartness.',
    confidence: 95,
    inventoryAvailable: false
  }
];
