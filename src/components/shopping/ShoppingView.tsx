import React, { useState, useMemo } from 'react';
import { useKitchen } from '../../context/KitchenContext';
import { ShoppingItem, FoodCategory } from '../../types';
import {
  ShoppingCart,
  Plus,
  Check,
  Trash2,
  PackageCheck,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Tag,
  CheckCircle2,
  X
} from 'lucide-react';
import { categorizeIngredient, estimateItemPrice } from '../../services/shoppingIntelligence';
import { findSubstitutionForIngredient } from '../../services/substitutionEngine';

export const ShoppingView: React.FC = () => {
  const {
    shoppingList,
    toggleShoppingItem,
    removeShoppingItem,
    markShoppingItemPurchased,
    addShoppingItem,
    inventory,
    setActiveTab
  } = useKitchen();

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemUnit, setNewItemUnit] = useState<string>('pcs');
  const [detectedSubSuggestion, setDetectedSubSuggestion] = useState<any | null>(null);

  // When user types a new item name, proactively check if a pantry substitute exists!
  const handleItemNameChange = (val: string) => {
    setNewItemName(val);
    if (val.trim().length > 3) {
      const match = findSubstitutionForIngredient(val, inventory);
      if (match) {
        setDetectedSubSuggestion(match);
      } else {
        setDetectedSubSuggestion(null);
      }
    } else {
      setDetectedSubSuggestion(null);
    }
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addShoppingItem(newItemName.trim(), newItemQty, newItemUnit, 'Manually added to list');
    setIsAddModalOpen(false);
    setNewItemName('');
    setDetectedSubSuggestion(null);
  };

  // Group shopping items by category
  const categories: FoodCategory[] = [
    'Vegetables',
    'Fruits',
    'Dairy',
    'Grains',
    'Spices',
    'Protein',
    'Other'
  ];

  const groupedItems = useMemo(() => {
    const map: Record<FoodCategory, ShoppingItem[]> = {
      Vegetables: [],
      Fruits: [],
      Dairy: [],
      Grains: [],
      Spices: [],
      Protein: [],
      Other: []
    };

    shoppingList.forEach((item) => {
      const cat = item.category || categorizeIngredient(item.name);
      if (!map[cat]) {
        map['Other'].push(item);
      } else {
        map[cat].push(item);
      }
    });

    return map;
  }, [shoppingList]);

  const totalEstimatedCost = useMemo(() => {
    return shoppingList.reduce((acc, item) => acc + (item.estimatedPrice || 25), 0);
  }, [shoppingList]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                  Smart Shopping List
                </h1>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {shoppingList.length} items
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Categorized grocery list with proactive culinary substitution checks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-slate-400 font-medium block">Est. Grocery Cost</span>
              <span className="text-sm font-extrabold text-slate-800">₹{totalEstimatedCost}</span>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Zero-Waste Substitution Advisor Alert Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 p-4 rounded-3xl flex items-start gap-3 text-xs text-amber-900">
        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
          💡
        </div>
        <div>
          <span className="font-bold text-amber-950 block">AI Zero-Waste Restock Rule:</span>
          <p className="mt-0.5 leading-relaxed text-amber-900/90">
            Before buying missing ingredients for recipes, SmartKitchen AI first checks whether an effective culinary substitute exists in your pantry (e.g. Milk + Lemon for Buttermilk), saving you money and preventing unnecessary purchases.
          </p>
        </div>
      </div>

      {/* Categorized List */}
      {shoppingList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-soft">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800">Your shopping list is all clear!</h3>
          <p className="text-xs text-slate-400 mt-1">
            Missing recipe ingredients or low pantry items will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {categories.map((cat) => {
            const items = groupedItems[cat];
            if (!items || items.length === 0) return null;

            return (
              <div key={cat} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <span className="text-base">
                      {cat === 'Vegetables' ? '🥦' : cat === 'Fruits' ? '🍎' : cat === 'Dairy' ? '🥛' : cat === 'Grains' ? '🍞' : cat === 'Protein' ? '🥚' : cat === 'Spices' ? '🌶️' : '📦'}
                    </span>
                    <span>{cat}</span>
                    <span className="text-xs font-semibold text-slate-400">({items.length})</span>
                  </h3>
                </div>

                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        item.checked
                          ? 'bg-slate-50/80 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200/90 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleShoppingItem(item.id)}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                            item.checked
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 hover:border-blue-500'
                          }`}
                        >
                          {item.checked && <Check className="w-3.5 h-3.5" />}
                        </button>

                        <div>
                          <p
                            className={`font-bold text-sm ${
                              item.checked ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-semibold text-slate-700">
                              {item.quantity} {item.unit}
                            </span>
                            <span>•</span>
                            <span className="text-blue-600 font-medium">₹{item.estimatedPrice}</span>
                            <span>•</span>
                            <span className="italic text-slate-400">{item.reason}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action Tools */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => markShoppingItemPurchased(item.id)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1 transition-colors"
                          title="Bought this! Move into Pantry Shelf with fresh expiry"
                        >
                          <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mark Purchased</span>
                        </button>

                        <button
                          onClick={() => removeShoppingItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete from list"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Item Modal with Proactive Substitution Detection */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-float p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-800">Add to Shopping List</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Buttermilk, Coriander, Milk, Eggs"
                  value={newItemName}
                  onChange={(e) => handleItemNameChange(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Proactive Substitution Detection Card */}
              {detectedSubSuggestion && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Substitute Found in your Pantry!</span>
                  </div>
                  <p className="text-[11px] text-slate-700">
                    You can make <span className="font-bold">{detectedSubSuggestion.substitution.originalIngredient}</span> by mixing{' '}
                    <span className="font-bold text-emerald-700">{detectedSubSuggestion.substitution.substituteName}</span>!
                  </p>
                  <p className="text-[11px] text-slate-500 italic">
                    Ratio: {detectedSubSuggestion.substitution.ratio}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setNewItemName('');
                      setDetectedSubSuggestion(null);
                    }}
                    className="w-full py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Use Pantry Substitute Instead of Buying
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Number(e.target.value))}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Unit</label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="pcs">pcs</option>
                    <option value="bunch">bunch</option>
                    <option value="cups">cups</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="Litre">Litre</option>
                    <option value="pack">pack</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Add to List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
