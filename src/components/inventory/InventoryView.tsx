import React, { useState, useMemo } from 'react';
import { useKitchen } from '../../context/KitchenContext';
import { Ingredient, FreshnessStatus, FoodCategory, StorageType } from '../../types';
import {
  PackageOpen,
  Plus,
  Search,
  Filter,
  Clock,
  ChefHat,
  Trash2,
  Edit2,
  AlertTriangle,
  Sparkles,
  CheckCircle,
  X,
  Layers
} from 'lucide-react';
import { assessFreshness, FOOD_SAFETY_DISCLAIMER } from '../../services/freshnessService';
import { DisclaimerBadge } from '../layout/DisclaimerBadge';

export const InventoryView: React.FC = () => {
  const { inventory, updateIngredient, deleteIngredient, addIngredient, setActiveTab } = useKitchen();

  const [activeStatusTab, setActiveStatusTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);

  // New item form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<FoodCategory>('Vegetables');
  const [newQty, setNewQty] = useState(2);
  const [newUnit, setNewUnit] = useState('pcs');
  const [newStorage, setNewStorage] = useState<StorageType>('Countertop');
  const [newIcon, setNewIcon] = useState('🥦');

  // Filtered inventory items
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      // Status filter
      if (activeStatusTab !== 'all' && item.freshnessStatus !== activeStatusTab) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }
      // Search
      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.category.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [inventory, activeStatusTab, categoryFilter, searchQuery]);

  // Counts for status tabs
  const counts = useMemo(() => {
    return {
      all: inventory.length,
      'use-soon': inventory.filter((i) => i.freshnessStatus === 'use-soon').length,
      'check-food': inventory.filter((i) => i.freshnessStatus === 'check-food').length,
      fresh: inventory.filter((i) => i.freshnessStatus === 'fresh').length,
      'past-date': inventory.filter((i) => i.freshnessStatus === 'past-date').length,
    };
  }, [inventory]);

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const assessment = assessFreshness(newCategory, 0, newStorage, false);

    const item: Ingredient = {
      id: `ing-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      quantity: Number(newQty) || 1,
      unit: newUnit,
      purchaseDate: new Date().toISOString().split('T')[0],
      estimatedShelfLifeDays: assessment.estimatedShelfLifeDays,
      freshnessStatus: assessment.status,
      freshnessReason: assessment.reason,
      storageType: newStorage,
      icon: newIcon,
      estimatedGrams: newUnit === 'pcs' ? Number(newQty) * 120 : Number(newQty) * 250,
      estimatedCostValue: 30
    };

    addIngredient(item);
    setIsAddModalOpen(false);
    setNewName('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <PackageOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                  Kitchen Pantry & Freshness Shelf
                </h1>
                <span className="text-xs font-bold text-slate-500">
                  ({inventory.length} items)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                AI dynamically estimates shelf-life and tracks freshness to eliminate pantry waste.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('scan')}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Scan Groceries</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Freshness Status Filter Tabs (Prominently displays 🔴 Use Soon, 🟠 Check Food, 🟢 Fresh, ⚫ Past Date) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Items', count: counts.all, color: 'border-slate-300 text-slate-700' },
          { id: 'use-soon', label: '🔴 Use Soon', count: counts['use-soon'], color: 'border-rose-300 text-rose-800 bg-rose-50/70' },
          { id: 'check-food', label: '🟠 Check Food', count: counts['check-food'], color: 'border-amber-300 text-amber-800 bg-amber-50/70' },
          { id: 'fresh', label: '🟢 Fresh', count: counts.fresh, color: 'border-emerald-300 text-emerald-800 bg-emerald-50/70' },
          { id: 'past-date', label: '⚫ Past Date', count: counts['past-date'], color: 'border-slate-300 text-slate-600 bg-slate-100' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveStatusTab(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-2 ${
              activeStatusTab === tab.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : `${tab.color} hover:opacity-90`
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeStatusTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/80 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pantry ingredients by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs text-slate-800 bg-transparent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Dairy">Dairy</option>
            <option value="Grains">Grains</option>
            <option value="Protein">Protein</option>
            <option value="Spices">Spices</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Inventory Cards Grid */}
      {filteredInventory.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-soft">
          <PackageOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-700">No ingredients match this filter</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search or add new items via the AI scanner.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredInventory.map((item) => {
            const isUrgent = item.freshnessStatus === 'use-soon';
            const isCheck = item.freshnessStatus === 'check-food';
            const isFresh = item.freshnessStatus === 'fresh';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-4 border transition-all duration-200 shadow-soft hover:shadow-card flex flex-col justify-between ${
                  isUrgent
                    ? 'border-rose-200 bg-rose-50/10 ring-1 ring-rose-300/40'
                    : isCheck
                    ? 'border-amber-200 bg-amber-50/10'
                    : 'border-slate-200/80'
                }`}
              >
                <div>
                  {/* Top Row: Icon, Category & Freshness Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl p-1.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-xs">
                        {item.icon}
                      </span>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {item.category}
                        </span>
                        <h3 className="font-bold text-base text-slate-800 leading-tight">
                          {item.name}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-800'
                          : isCheck
                          ? 'bg-amber-100 text-amber-800'
                          : isFresh
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isUrgent
                        ? '🔴 Use Soon'
                        : isCheck
                        ? '🟠 Check'
                        : isFresh
                        ? '🟢 Fresh'
                        : '⚫ Past Date'}
                    </span>
                  </div>

                  {/* Quantity & Storage */}
                  <div className="mt-3 flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700">
                      Stock: {item.quantity} {item.unit}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      📍 {item.storageType}
                    </span>
                  </div>

                  {/* Freshness Estimation Reason */}
                  <div className="mt-2.5 text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100/80">
                    <div className="flex items-center gap-1 font-semibold text-slate-700">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Est. Remaining: ~{item.estimatedShelfLifeDays} days</span>
                    </div>
                    <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-2">
                      {item.freshnessReason}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveTab('cook')}
                    className="flex-1 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ChefHat className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cook With It</span>
                  </button>

                  <button
                    onClick={() => deleteIngredient(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-float p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-800">Add Pantry Ingredient</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Ingredient Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Carrots, Paneer, Apples"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as FoodCategory)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Grains">Grains</option>
                    <option value="Protein">Protein</option>
                    <option value="Spices">Spices</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Storage</label>
                  <select
                    value={newStorage}
                    onChange={(e) => setNewStorage(e.target.value as StorageType)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Countertop">Countertop</option>
                    <option value="Refrigerator">Refrigerator</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Freezer">Freezer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Unit</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="pcs">pcs</option>
                    <option value="cups">cups</option>
                    <option value="bunch">bunch</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="slices">slices</option>
                    <option value="Litre">Litre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Icon</label>
                  <input
                    type="text"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 text-center"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-[11px] text-emerald-800">
                💡 <span className="font-semibold">AI Shelf-Life Prediction: </span>
                Freshness will be automatically calculated based on food category and storage type.
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
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Save Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DisclaimerBadge />
    </div>
  );
};
