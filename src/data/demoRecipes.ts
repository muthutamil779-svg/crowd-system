import { Recipe } from '../types';

export const demoRecipes: Recipe[] = [
  {
    id: 'rec-tomato-egg-curry',
    name: 'Homestyle Tomato Egg Curry',
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    icon: '🍳',
    baseServings: 2,
    prepTimeMinutes: 18,
    difficulty: 'Easy',
    cuisine: 'South Asian Comfort',
    tags: ['High Waste Prevention', 'Fast & Easy', 'Protein Rich'],
    description: 'A savory, tangy gravy bursting with roasted spices, sweet softened tomatoes, and golden simmered eggs.',
    ingredients: [
      { name: 'Tomato', quantity: 2, unit: 'pcs' },
      { name: 'Eggs', quantity: 2, unit: 'pcs' },
      { name: 'Onion', quantity: 1, unit: 'pcs' },
      { name: 'Oil & Spices (Chili, Turmeric, Cumin)', quantity: 1, unit: 'tbsp', optional: true }
    ],
    instructions: [
      'Boil and peel the eggs, make shallow slits, and lightly sear in 1/2 tsp oil until golden.',
      'Finely dice the ripe tomatoes and onions.',
      'Sauté chopped onion in a skillet until translucent; add ginger-garlic and basic spices.',
      'Add the softened tomatoes and cook until soft and oil leaves the sides (~5 minutes).',
      'Drop in the seared eggs, add 1/4 cup water, simmer on medium for 4 minutes. Garnish with fresh cilantro.'
    ]
  },
  {
    id: 'rec-banana-pancakes',
    name: 'Zero-Waste Golden Banana Pancakes',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80',
    icon: '🥞',
    baseServings: 2,
    prepTimeMinutes: 12,
    difficulty: 'Easy',
    cuisine: 'Breakfast & Brunch',
    tags: ['Rescues Ripe Fruit', 'Kid Friendly', 'No Refined Sugar'],
    description: 'Transform sweet speckled bananas and remaining opened milk into fluffy, naturally sweet golden pancakes.',
    ingredients: [
      { name: 'Banana', quantity: 2, unit: 'pcs' },
      { name: 'Milk', quantity: 0.75, unit: 'cups' },
      { name: 'Eggs', quantity: 1, unit: 'pcs' },
      { name: 'Flour / Oats', quantity: 1, unit: 'cup', optional: false, substituteOption: 'sub-cornstarch' },
      { name: 'Buttermilk', quantity: 0.5, unit: 'cups', optional: true, substituteOption: 'sub-buttermilk' }
    ],
    instructions: [
      'In a mixing bowl, mash the ripe bananas with a fork until smooth.',
      'Whisk in the egg and measured milk until thoroughly combined.',
      'Gently fold in 1 cup of flour until just mixed (do not overwork the batter).',
      'Heat a lightly greased non-stick griddle over medium heat.',
      'Pour 1/4 cup batter for each pancake. Cook until bubbles form on top (~2 mins), flip and cook for 1 more minute until golden.'
    ]
  },
  {
    id: 'rec-spinach-egg-scramble',
    name: 'Garlic Palak & Egg Bhurji',
    category: 'Quick Bites',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    icon: '🥬',
    baseServings: 2,
    prepTimeMinutes: 10,
    difficulty: 'Easy',
    cuisine: 'Quick Healthy',
    tags: ['Iron Packed', 'Fast Under 10m', 'Zero Waste Greens'],
    description: 'Quick tender sauté of fragile spinach leaves tossed with whipped eggs, green chillies, and crushed garlic.',
    ingredients: [
      { name: 'Spinach', quantity: 1, unit: 'bunch' },
      { name: 'Eggs', quantity: 3, unit: 'pcs' },
      { name: 'Onion', quantity: 1, unit: 'pcs' }
    ],
    instructions: [
      'Rinse spinach thoroughly, drain well, and roughly chop.',
      'Heat oil in a pan, add chopped onion and green chillies, sauté for 2 mins.',
      'Toss in chopped spinach and wilt over high flame for 90 seconds.',
      'Pour in whisked eggs with a pinch of salt and pepper.',
      'Scramble gently over medium-low heat until creamy and set. Serve hot with toast.'
    ]
  },
  {
    id: 'rec-spicy-masala-toast',
    name: 'Spicy Tomato Onion Street Toast',
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80',
    icon: '🥪',
    baseServings: 2,
    prepTimeMinutes: 8,
    difficulty: 'Easy',
    cuisine: 'Street Food',
    tags: ['Rescues Bread', 'Instant Meal', 'Crunchy'],
    description: 'Crispy pan-toasted bread topped with a tangy sauté of ripe tomatoes, onions, and warming spices.',
    ingredients: [
      { name: 'Bread Slices', quantity: 4, unit: 'slices' },
      { name: 'Tomato', quantity: 1, unit: 'pcs' },
      { name: 'Onion', quantity: 1, unit: 'pcs' }
    ],
    instructions: [
      'Dice the ripe tomato and onion finely.',
      'Sauté onions in butter or oil for 1 minute, add tomatoes, pinch of salt, turmeric, and chili.',
      'Cook for 2 minutes until juicy and soft.',
      'Toast the bread slices in the pan until crisp and golden on both sides.',
      'Spoon the warm tomato-onion masala over the toasts and serve immediately.'
    ]
  },
  {
    id: 'rec-potato-egg-hash',
    name: 'Skillet Crispy Potato & Fried Eggs',
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=800&q=80',
    icon: '🥔',
    baseServings: 2,
    prepTimeMinutes: 20,
    difficulty: 'Medium',
    cuisine: 'Rustic Diner',
    tags: ['Comfort Food', 'High Energy', 'Pantry Friendly'],
    description: 'Golden, crispy potato cubes skillet-tossed with sweet caramelized onions and crowned with sunny-side-up eggs.',
    ingredients: [
      { name: 'Potato', quantity: 3, unit: 'pcs' },
      { name: 'Eggs', quantity: 2, unit: 'pcs' },
      { name: 'Onion', quantity: 1, unit: 'pcs' }
    ],
    instructions: [
      'Cube potatoes into bite-sized 1/2 inch pieces. Microwave or parboil for 3 mins to speed cooking.',
      'Heat 2 tbsp oil in a heavy skillet over medium-high heat. Add potatoes in single layer.',
      'Cook undisturbed for 4 mins until bottom is crispy brown, then flip.',
      'Add sliced onion and cook together until onions caramelize and potatoes are tender.',
      'Make wells in the pan, crack eggs into the spaces, cover and cook for 3 mins until whites are set.'
    ]
  },
  {
    id: 'rec-bread-milk-pudding',
    name: 'Warm Cinnamon Bread & Milk Pudding',
    category: 'Dessert',
    image: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=800&q=80',
    icon: '🍮',
    baseServings: 2,
    prepTimeMinutes: 15,
    difficulty: 'Easy',
    cuisine: 'Bakery Classics',
    tags: ['Rescues Milk & Bread', 'Comfort Dessert', 'No Waste Sweet'],
    description: 'Soak day-old bread slices in sweet warm spiced milk and egg custard, baked or pan-steamed to silky perfection.',
    ingredients: [
      { name: 'Bread Slices', quantity: 3, unit: 'slices' },
      { name: 'Milk', quantity: 1, unit: 'cups' },
      { name: 'Eggs', quantity: 1, unit: 'pcs' }
    ],
    instructions: [
      'Tear the bread slices into bite-sized cubes and place in a greased baking dish or pan.',
      'Whisk together milk, egg, and 2 tsp sugar or honey with a pinch of cardamom or cinnamon.',
      'Pour the spiced milk mixture evenly over the bread cubes. Let soak for 4 minutes.',
      'Cover with foil and steam in a pan or bake at 180°C (350°F) for 12-14 minutes until custard is set.',
      'Serve warm, optionally drizzled with honey.'
    ]
  }
];
