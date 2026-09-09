import { ShoppingItem, FoodCategory, Ingredient } from '../types';

export function categorizeIngredient(name: string): FoodCategory {
  const n = name.toLowerCase();
  if (n.includes('tomato') || n.includes('onion') || n.includes('potato') || n.includes('spinach') || n.includes('garlic') || n.includes('ginger') || n.includes('carrot')) {
    return 'Vegetables';
  }
  if (n.includes('banana') || n.includes('lemon') || n.includes('apple') || n.includes('orange') || n.includes('berry')) {
    return 'Fruits';
  }
  if (n.includes('milk') || n.includes('curd') || n.includes('yogurt') || n.includes('butter') || n.includes('cheese') || n.includes('cream')) {
    return 'Dairy';
  }
  if (n.includes('bread') || n.includes('rice') || n.includes('flour') || n.includes('oats') || n.includes('pasta')) {
    return 'Grains';
  }
  if (n.includes('egg') || n.includes('chicken') || n.includes('paneer') || n.includes('tofu') || n.includes('fish') || n.includes('lentil') || n.includes('dal')) {
    return 'Protein';
  }
  if (n.includes('salt') || n.includes('pepper') || n.includes('turmeric') || n.includes('chili') || n.includes('cumin') || n.includes('oil')) {
    return 'Spices';
  }
  return 'Other';
}

export function estimateItemPrice(name: string, quantity: number, unit: string): number {
  const n = name.toLowerCase();
  let basePrice = 25;
  if (n.includes('milk')) basePrice = 30;
  if (n.includes('egg')) basePrice = 7 * quantity;
  if (n.includes('tomato') || n.includes('onion')) basePrice = 20 * (unit === 'kg' ? quantity : Math.max(1, quantity * 0.5));
  if (n.includes('paneer') || n.includes('chicken')) basePrice = 80;
  return Math.max(15, Math.round(basePrice));
}

export function createIngredientFromShoppingItem(item: ShoppingItem): Ingredient {
  const category = item.category;
  let estimatedDays = 7;
  let icon = '📦';

  if (category === 'Vegetables') {
    estimatedDays = 6;
    icon = '🥦';
    if (item.name.toLowerCase().includes('tomato')) icon = '🍅';
    if (item.name.toLowerCase().includes('onion')) icon = '🧅';
    if (item.name.toLowerCase().includes('potato')) icon = '🥔';
    if (item.name.toLowerCase().includes('spinach')) icon = '🥬';
  } else if (category === 'Fruits') {
    estimatedDays = 5;
    icon = '🍎';
    if (item.name.toLowerCase().includes('banana')) icon = '🍌';
    if (item.name.toLowerCase().includes('lemon')) icon = '🍋';
  } else if (category === 'Dairy') {
    estimatedDays = 6;
    icon = '🥛';
  } else if (category === 'Protein') {
    estimatedDays = 12;
    icon = item.name.toLowerCase().includes('egg') ? '🥚' : '🥩';
  } else if (category === 'Grains') {
    estimatedDays = 14;
    icon = '🍞';
  }

  return {
    id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    purchaseDate: new Date().toISOString().split('T')[0],
    estimatedShelfLifeDays: estimatedDays,
    freshnessStatus: 'fresh',
    freshnessReason: 'Freshly purchased item added to inventory.',
    storageType: category === 'Dairy' || item.name.toLowerCase().includes('spinach') ? 'Refrigerator' : 'Countertop',
    icon,
    estimatedCostValue: item.estimatedPrice,
    estimatedGrams: item.unit === 'pcs' ? item.quantity * 100 : item.quantity * 250
  };
}
