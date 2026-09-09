import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Ingredient,
  Recipe,
  ShoppingItem,
  ImpactStats,
  KitchenNotification,
  FreshnessStatus
} from '../types';
import { initialInventory } from '../data/demoInventory';
import { demoRecipes } from '../data/demoRecipes';
import { createIngredientFromShoppingItem } from '../services/shoppingIntelligence';
import confetti from 'canvas-confetti';

interface KitchenContextType {
  inventory: Ingredient[];
  recipes: Recipe[];
  shoppingList: ShoppingItem[];
  impact: ImpactStats;
  notifications: KitchenNotification[];
  activeTab: string;
  selectedRecipeId: string | null;
  unreadCount: number;
  setActiveTab: (tab: string) => void;
  setSelectedRecipeId: (id: string | null) => void;
  addIngredient: (item: Ingredient) => void;
  addIngredients: (items: Ingredient[]) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  addShoppingItem: (name: string, quantity: number, unit: string, reason?: string) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  markShoppingItemPurchased: (id: string) => void;
  cookRecipe: (recipe: Recipe, servings: number) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
}

const defaultImpact: ImpactStats = {
  foodWastePreventedKg: 2.4,
  moneySaved: 840,
  ingredientsRescued: 17,
  mealsCreated: 12,
  shoppingTripsAvoided: 4,
  sustainabilityScore: 82,
  history: [
    { date: 'Mon', wastePreventedKg: 0.4, moneySaved: 140 },
    { date: 'Tue', wastePreventedKg: 0.6, moneySaved: 210 },
    { date: 'Wed', wastePreventedKg: 0.3, moneySaved: 110 },
    { date: 'Thu', wastePreventedKg: 0.5, moneySaved: 180 },
    { date: 'Fri', wastePreventedKg: 0.6, moneySaved: 200 },
  ]
};

const defaultShoppingList: ShoppingItem[] = [
  {
    id: 'shop-1',
    name: 'Fresh Coriander / Cilantro',
    quantity: 1,
    unit: 'bunch',
    category: 'Vegetables',
    checked: false,
    reason: 'Garnish for curries & bowls',
    estimatedPrice: 15,
    addedAt: '2026-09-07'
  },
  {
    id: 'shop-2',
    name: 'Mustard Seeds (Rai)',
    quantity: 100,
    unit: 'g',
    category: 'Spices',
    checked: false,
    reason: 'Low pantry stock',
    estimatedPrice: 35,
    addedAt: '2026-09-06'
  },
  {
    id: 'shop-3',
    name: 'Greek Yogurt / Plain Curd',
    quantity: 400,
    unit: 'g',
    category: 'Dairy',
    checked: true,
    reason: 'Versatile kitchen staple & substitute',
    estimatedPrice: 50,
    addedAt: '2026-09-05'
  }
];

const defaultNotifications: KitchenNotification[] = [
  {
    id: 'notif-1',
    title: '⚠️ Use Your Tomato Soon',
    message: 'Your ripe tomatoes may spoil in ~1–2 days. AI suggests: Homestyle Tomato Egg Curry (Uses: Tomato + Egg + Onion).',
    type: 'urgent',
    recipeId: 'rec-tomato-egg-curry',
    actionLabel: 'Cook Now',
    actionRoute: 'cook',
    timestamp: '10 mins ago',
    read: false
  },
  {
    id: 'notif-2',
    title: '🥛 Milk is running low',
    message: 'Opened carton has ~1.5 cups remaining. Prioritize banana pancakes or custard today.',
    type: 'warning',
    recipeId: 'rec-banana-pancakes',
    actionLabel: 'View Recipe',
    actionRoute: 'cook',
    timestamp: '2 hours ago',
    read: false
  },
  {
    id: 'notif-3',
    title: '🍌 Banana needs attention',
    message: 'Sugar speckles detected on bananas. Great time to make sweet treats or freeze for smoothies.',
    type: 'info',
    recipeId: 'rec-banana-pancakes',
    actionLabel: 'See Ideas',
    actionRoute: 'cook',
    timestamp: '5 hours ago',
    read: true
  }
];

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

export const KitchenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem('smartkitchen_inventory');
    return saved ? JSON.parse(saved) : initialInventory;
  });

  const [recipes] = useState<Recipe[]>(demoRecipes);

  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('smartkitchen_shopping');
    return saved ? JSON.parse(saved) : defaultShoppingList;
  });

  const [impact, setImpact] = useState<ImpactStats>(() => {
    const saved = localStorage.getItem('smartkitchen_impact');
    return saved ? JSON.parse(saved) : defaultImpact;
  });

  const [notifications, setNotifications] = useState<KitchenNotification[]>(() => {
    const saved = localStorage.getItem('smartkitchen_notifications');
    return saved ? JSON.parse(saved) : defaultNotifications;
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('smartkitchen_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('smartkitchen_shopping', JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem('smartkitchen_impact', JSON.stringify(impact));
  }, [impact]);

  useEffect(() => {
    localStorage.setItem('smartkitchen_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addIngredient = (item: Ingredient) => {
    setInventory((prev) => [item, ...prev]);
  };

  const addIngredients = (items: Ingredient[]) => {
    setInventory((prev) => {
      // Merge or append
      const updated = [...prev];
      items.forEach((newItem) => {
        const existingIdx = updated.findIndex(
          (u) => u.name.toLowerCase() === newItem.name.toLowerCase()
        );
        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + newItem.quantity,
            freshnessStatus: newItem.freshnessStatus,
            estimatedShelfLifeDays: newItem.estimatedShelfLifeDays,
            freshnessReason: newItem.freshnessReason
          };
        } else {
          updated.unshift(newItem);
        }
      });
      return updated;
    });
  };

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteIngredient = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  };

  const addShoppingItem = (
    name: string,
    quantity: number,
    unit: string,
    reason: string = 'Added by SmartKitchen AI'
  ) => {
    const newItem: ShoppingItem = {
      id: `shop-${Date.now()}`,
      name,
      quantity,
      unit,
      category: 'Vegetables',
      checked: false,
      reason,
      estimatedPrice: 30,
      addedAt: new Date().toISOString().split('T')[0]
    };
    setShoppingList((prev) => [newItem, ...prev]);
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...checkedItem(item) } : item))
    );
  };

  const checkedItem = (item: ShoppingItem) => ({ checked: !item.checked });

  const removeShoppingItem = (id: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id));
  };

  const markShoppingItemPurchased = (id: string) => {
    const item = shoppingList.find((s) => s.id === id);
    if (!item) return;

    // Add to inventory
    const newIngredient = createIngredientFromShoppingItem(item);
    addIngredient(newIngredient);

    // Remove from shopping list
    removeShoppingItem(id);

    // Push celebratory notification
    const notif: KitchenNotification = {
      id: `notif-${Date.now()}`,
      title: `✅ Restocked ${item.name}`,
      message: `Added ${item.quantity} ${item.unit} to your pantry inventory with fresh estimated shelf-life.`,
      type: 'info',
      actionLabel: 'View Pantry',
      actionRoute: 'inventory',
      timestamp: 'Just now',
      read: false
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const cookRecipe = (recipe: Recipe, servings: number) => {
    const scaleFactor = servings / recipe.baseServings;
    let rescuedCount = 0;
    let rescuedGrams = 0;
    let rescuedRupees = 0;

    // Deduct quantities from inventory
    setInventory((prev) => {
      const updated = prev.map((invItem) => {
        const matchedRecIng = recipe.ingredients.find(
          (r) =>
            r.name.toLowerCase().includes(invItem.name.toLowerCase()) ||
            invItem.name.toLowerCase().includes(r.name.toLowerCase())
        );

        if (matchedRecIng) {
          const usedQty = matchedRecIng.quantity * scaleFactor;
          const remainingQty = Math.max(0, Math.round((invItem.quantity - usedQty) * 10) / 10);

          if (invItem.freshnessStatus === 'use-soon' || invItem.freshnessStatus === 'check-food') {
            rescuedCount++;
            rescuedGrams += (invItem.estimatedGrams || 150) * Math.min(1, usedQty / invItem.quantity);
            rescuedRupees += (invItem.estimatedCostValue || 25);
          }

          return {
            ...invItem,
            quantity: remainingQty
          };
        }
        return invItem;
      });

      // Filter out items that hit 0
      return updated.filter((item) => item.quantity > 0);
    });

    // Update Impact
    const addedKg = Math.max(0.2, Math.round((rescuedGrams / 1000) * 10) / 10 || 0.35);
    const addedMoney = Math.max(30, Math.round(rescuedRupees || 60));

    setImpact((prev) => ({
      ...prev,
      foodWastePreventedKg: Math.round((prev.foodWastePreventedKg + addedKg) * 10) / 10,
      moneySaved: prev.moneySaved + addedMoney,
      ingredientsRescued: prev.ingredientsRescued + (rescuedCount || 2),
      mealsCreated: prev.mealsCreated + 1,
      sustainabilityScore: Math.min(99, prev.sustainabilityScore + 2),
      history: [
        ...prev.history,
        {
          date: 'Today',
          wastePreventedKg: addedKg,
          moneySaved: addedMoney
        }
      ]
    }));

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    // Add notification
    const successNotif: KitchenNotification = {
      id: `notif-${Date.now()}`,
      title: `🎉 Cooked: ${recipe.name}!`,
      message: `Prevented ${addedKg}kg food waste and saved ~₹${addedMoney}! Your kitchen sustainability score increased.`,
      type: 'tip',
      actionLabel: 'View Impact',
      actionRoute: 'impact',
      timestamp: 'Just now',
      read: false
    };
    setNotifications((prev) => [successNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetDemoData = () => {
    setInventory(initialInventory);
    setShoppingList(defaultShoppingList);
    setImpact(defaultImpact);
    setNotifications(defaultNotifications);
    localStorage.clear();
  };

  return (
    <KitchenContext.Provider
      value={{
        inventory,
        recipes,
        shoppingList,
        impact,
        notifications,
        activeTab,
        selectedRecipeId,
        unreadCount,
        setActiveTab,
        setSelectedRecipeId,
        addIngredient,
        addIngredients,
        updateIngredient,
        deleteIngredient,
        addShoppingItem,
        toggleShoppingItem,
        removeShoppingItem,
        markShoppingItemPurchased,
        cookRecipe,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoData
      }}
    >
      {children}
    </KitchenContext.Provider>
  );
};

export const useKitchen = () => {
  const context = useContext(KitchenContext);
  if (!context) {
    throw new Error('useKitchen must be used within a KitchenProvider');
  }
  return context;
};
