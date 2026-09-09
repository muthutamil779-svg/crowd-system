import { Ingredient, Recipe } from '../types';

export interface AssistantAction {
  label: string;
  actionType: 'navigate_cook' | 'navigate_shopping' | 'navigate_inventory' | 'add_shopping_item' | 'open_recipe';
  payload?: any;
}

export interface AssistantResponse {
  message: string;
  languageDetected: 'English' | 'Tanglish' | 'Tamil';
  actions?: AssistantAction[];
  highlightItems?: string[];
}

export function processUserKitchenQuery(
  rawQuery: string,
  inventory: Ingredient[],
  recipes: Recipe[]
): AssistantResponse {
  const query = rawQuery.toLowerCase().trim();

  // 1. Tanglish / Tamil: "Enna samaikkalam" (What can I cook / what should we cook?)
  if (
    query.includes('enna samaikkalam') ||
    query.includes('enna samayalam') ||
    query.includes('what should i cook') ||
    query.includes('what can i cook') ||
    query.includes('what to cook')
  ) {
    const urgentItems = inventory.filter(
      (i) => i.freshnessStatus === 'use-soon' || i.freshnessStatus === 'check-food'
    );
    const urgentNames = urgentItems.map((i) => i.name).join(', ');

    if (urgentItems.length > 0) {
      return {
        languageDetected: query.includes('enna') ? 'Tanglish' : 'English',
        message: `Vanakkam! Inga ungakitta **${urgentNames}** seekiram expire aagira mathiri irukku (expiring soon). Muthalla **Homestyle Tomato Egg Curry** cook pannalam — ithula 2 urgent items waste aagama save aagum!`,
        actions: [
          {
            label: '🍳 Cook Tomato Egg Curry Now',
            actionType: 'open_recipe',
            payload: 'rec-tomato-egg-curry'
          },
          {
            label: '👀 View All Expiring Items',
            actionType: 'navigate_inventory'
          }
        ],
        highlightItems: urgentItems.map((i) => i.name)
      };
    } else {
      return {
        languageDetected: 'English',
        message:
          'Your inventory is looking wonderfully fresh! I recommend making Homestyle Tomato Egg Curry or Crispy Potato Hash today.',
        actions: [
          {
            label: 'Explore Recipes',
            actionType: 'navigate_cook'
          }
        ]
      };
    }
  }

  // 2. Tanglish / Tamil: "Milk mudinjiduchu" (Milk is finished / out of stock)
  if (
    query.includes('mudinjiduchu') ||
    query.includes('theerndhupochu') ||
    query.includes('theernthu') ||
    query.includes('milk is over') ||
    query.includes('out of milk') ||
    query.includes('ran out of')
  ) {
    const itemName = query.includes('milk') ? 'Milk' : 'Staple Groceries';
    return {
      languageDetected: query.includes('mudinjiduchu') ? 'Tanglish' : 'English',
      message: `Seri, purinjithu! **${itemName}** finish aayiducha? Smart Shopping List-la add pannidattuma?`,
      actions: [
        {
          label: `🛒 Add ${itemName} to Shopping List`,
          actionType: 'add_shopping_item',
          payload: { name: itemName, quantity: 1, unit: 'Litre', category: 'Dairy' }
        },
        {
          label: 'View Shopping List',
          actionType: 'navigate_shopping'
        }
      ],
      highlightItems: [itemName]
    };
  }

  // 3. "What is going to expire soon?" / "expiry status"
  if (
    query.includes('expire') ||
    query.includes('spoiling') ||
    query.includes('shelf life') ||
    query.includes('freshness') ||
    query.includes('use soon')
  ) {
    const useSoon = inventory.filter((i) => i.freshnessStatus === 'use-soon');
    const checkFood = inventory.filter((i) => i.freshnessStatus === 'check-food');

    if (useSoon.length === 0 && checkFood.length === 0) {
      return {
        languageDetected: 'English',
        message: 'Great news! None of your pantry items are currently marked as urgent. Everything is fresh.',
        actions: [{ label: 'View Full Inventory', actionType: 'navigate_inventory' }]
      };
    }

    const itemsSummary = useSoon
      .map((i) => `🔴 **${i.name}** (~${i.estimatedShelfLifeDays} days left)`)
      .concat(checkFood.map((i) => `🟠 **${i.name}** (~${i.estimatedShelfLifeDays} days left)`))
      .join('\n');

    return {
      languageDetected: 'English',
      message: `Here are the ingredients that need your immediate attention:\n\n${itemsSummary}\n\nShall we cook something to rescue them?`,
      actions: [
        {
          label: '🍳 Cook With Expiring Items',
          actionType: 'navigate_cook'
        },
        {
          label: 'Open Inventory',
          actionType: 'navigate_inventory'
        }
      ],
      highlightItems: useSoon.concat(checkFood).map((i) => i.name)
    };
  }

  // 4. "I have tomato, egg and onion. What can I cook?"
  if (
    (query.includes('tomato') && query.includes('egg')) ||
    (query.includes('have') && query.includes('cook'))
  ) {
    return {
      languageDetected: 'English',
      message:
        'With your **Tomatoes**, **Eggs**, and **Onions**, you have the exact ingredients to prepare delicious **Homestyle Tomato Egg Curry** or **Spicy Masala Street Toast**!',
      actions: [
        {
          label: '🍳 View Tomato Egg Curry',
          actionType: 'open_recipe',
          payload: 'rec-tomato-egg-curry'
        },
        {
          label: '🥪 View Masala Toast',
          actionType: 'open_recipe',
          payload: 'rec-spicy-masala-toast'
        }
      ],
      highlightItems: ['Tomato', 'Eggs', 'Onion']
    };
  }

  // 5. "What should I buy?" / "Shopping suggestions"
  if (query.includes('buy') || query.includes('shopping') || query.includes('market') || query.includes('kadai')) {
    return {
      languageDetected: query.includes('kadai') ? 'Tanglish' : 'English',
      message:
        'Based on your stock levels and planned recipes, your pantry is low on **Fresh Herbs (Coriander)** and you may want to restock **Milk**. Your shopping list currently has prioritized items ready.',
      actions: [
        {
          label: '🛒 Open Smart Shopping List',
          actionType: 'navigate_shopping'
        }
      ]
    };
  }

  // 6. Substitution query (e.g. buttermilk or lemon)
  if (query.includes('substitute') || query.includes('replace') || query.includes('buttermilk')) {
    return {
      languageDetected: 'English',
      message:
        '💡 **AI Kitchen Tip:** You don’t need to rush to the store! For **Buttermilk**, combine **1 cup milk + 1 tbsp fresh lemon juice** and let rest 5 minutes. The acid curdles the milk into perfect buttermilk!',
      actions: [
        {
          label: '🥞 View Banana Pancakes Recipe',
          actionType: 'open_recipe',
          payload: 'rec-banana-pancakes'
        }
      ]
    };
  }

  // Default helpful response
  return {
    languageDetected: 'English',
    message: `I'm your zero-waste SmartKitchen assistant! You currently have ${inventory.length} ingredients tracked. Ask me questions like:
- *"Enna samaikkalam?"*
- *"What is going to expire soon?"*
- *"Milk mudinjiduchu"*
- *"I have tomato, egg and onion. What can I cook?"*`,
    actions: [
      { label: '🍳 What Should I Cook?', actionType: 'navigate_cook' },
      { label: '📷 Scan Food', actionType: 'navigate_inventory' }
    ]
  };
}
