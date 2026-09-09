import React, { useState, useMemo } from 'react';
import { Recipe, Substitution } from '../../types';
import { useKitchen } from '../../context/KitchenContext';
import { scaleRecipe, calculateOptimalZeroWasteFit } from '../../services/scalingEngine';
import { findSubstitutionForIngredient } from '../../services/substitutionEngine';
import { SubstitutionDrawer } from './SubstitutionDrawer';
import {
  X,
  Clock,
  Flame,
  Users,
  Sparkles,
  Check,
  AlertTriangle,
  ChefHat,
  Scale,
  Plus,
  Minus,
  CheckCircle2,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ recipe, onClose }) => {
  const { inventory, cookRecipe, addShoppingItem } = useKitchen();

  if (!recipe) return null;

  // Portion state
  const [servings, setServings] = useState<number>(recipe.baseServings);
  const [activeSubstitute, setActiveSubstitute] = useState<Substitution | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isCookedSuccess, setIsCookedSuccess] = useState<boolean>(false);

  // Calculate scaled ingredients
  const scaledData = useMemo(() => {
    return scaleRecipe(recipe, servings, inventory);
  }, [recipe, servings, inventory]);

  // Check if there is an optimal zero-waste fit based on available inventory
  const optimalFit = useMemo(() => {
    return calculateOptimalZeroWasteFit(recipe, inventory);
  }, [recipe, inventory]);

  // Check substitutions for missing ingredients
  const substitutionSuggestions = useMemo(() => {
    const subs: Substitution[] = [];
    scaledData.ingredients.forEach((ing) => {
      if (!ing.inInventory) {
        const found = findSubstitutionForIngredient(ing.name, inventory);
        if (found) {
          subs.push(found.substitution);
        }
      }
    });
    return subs;
  }, [scaledData, inventory]);

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleApplyAutoFit = () => {
    if (optimalFit) {
      setServings(optimalFit.recommendedServings);
    }
  };

  const handleFinishCooking = () => {
    cookRecipe(recipe, servings);
    setIsCookedSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-float border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="relative p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-warm-50 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl sm:text-4xl p-2 bg-white rounded-2xl shadow-xs border border-emerald-100">
              {recipe.icon}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {recipe.category}
                </span>
                <span className="text-xs text-slate-500">• {recipe.cuisine}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-1">
                {recipe.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center shadow-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>{recipe.prepTimeMinutes} mins</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>{recipe.difficulty} Level</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5 text-emerald-700">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Zero-Waste Optimized</span>
            </div>
          </div>

          {/* ZERO-WASTE RECIPE SCALING ENGINE */}
          <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-sm text-emerald-950">
                  Zero-Waste Recipe Scaling
                </h3>
              </div>

              {/* Servings Adjuster */}
              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-emerald-200 shadow-xs self-start sm:self-auto">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-700">Serves:</span>

                <button
                  onClick={() => setServings((prev) => Math.max(1, prev - 1))}
                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-extrabold text-emerald-700 px-1">{servings}</span>
                <button
                  onClick={() => setServings((prev) => prev + 1)}
                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Auto-Fit Suggestion Button if optimal portion detected */}
            {optimalFit && optimalFit.recommendedServings !== servings && (
              <div className="bg-white rounded-xl p-3 border border-emerald-300 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-emerald-800">💡 AI Auto-Fit Suggestion: </span>
                  <span className="text-slate-600">
                    Scale to <span className="font-bold text-emerald-700">{optimalFit.recommendedServings} servings</span> to finish all available {optimalFit.limitingIngredientName} with zero leftovers!
                  </span>
                </div>
                <button
                  onClick={handleApplyAutoFit}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs whitespace-nowrap shadow-xs"
                >
                  Apply Auto-Fit
                </button>
              </div>
            )}

            {/* Original vs AI Adjusted Comparison Table */}
            <div className="overflow-x-auto pt-1">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-emerald-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Ingredient</th>
                    <th className="pb-2">Original (4 Servings)</th>
                    <th className="pb-2 text-emerald-700 font-extrabold">AI Adjusted ({servings} Servings)</th>
                    <th className="pb-2">Pantry Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {scaledData.ingredients.map((ing, idx) => {
                    const isUrgent = ing.status === 'use-soon';
                    return (
                      <tr key={idx} className="hover:bg-white/60">
                        <td className="py-2 font-bold text-slate-800">{ing.name}</td>
                        <td className="py-2 text-slate-400 font-medium">
                          {Math.round((ing.originalQty / (recipe.baseServings || 2)) * 4 * 10) / 10} {ing.unit}
                        </td>
                        <td className="py-2 font-extrabold text-emerald-700">
                          {ing.scaledQty} {ing.unit}
                        </td>
                        <td className="py-2">
                          {ing.inInventory ? (
                            <span
                              className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
                                isUrgent
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              <Check className="w-2.5 h-2.5" />
                              <span>{isUrgent ? '🔴 Use Soon' : 'Available'}</span>
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                Missing
                              </span>
                              <button
                                onClick={() => addShoppingItem(ing.name, ing.scaledQty, ing.unit, `Needed for ${recipe.name}`)}
                                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 underline"
                              >
                                + List
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI INGREDIENT SUBSTITUTION DRAWER */}
          {substitutionSuggestions.length > 0 && (
            <div className="space-y-3">
              {substitutionSuggestions.map((sub) => (
                <SubstitutionDrawer
                  key={sub.id}
                  substitution={sub}
                  onApplySubstitute={(applied) => setActiveSubstitute(applied)}
                  onAddMissingToShoppingList={(name, qty, unit) => {
                    addShoppingItem(name, qty, unit, `Requested for ${recipe.name}`);
                  }}
                />
              ))}
            </div>
          )}

          {activeSubstitute && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between">
              <div>
                <span className="font-bold">Active Swap: </span>
                <span>
                  Using <span className="underline font-semibold">{activeSubstitute.substituteName}</span> instead of {activeSubstitute.originalIngredient}.
                </span>
              </div>
              <button
                onClick={() => setActiveSubstitute(null)}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-bold ml-2"
              >
                Reset
              </button>
            </div>
          )}

          {/* Step-by-Step Cooking Guide */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-emerald-600" />
              <span>Step-by-Step Instructions</span>
            </h3>

            <div className="space-y-2.5">
              {recipe.instructions.map((step, idx) => {
                const isDone = completedSteps.includes(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isDone
                        ? 'bg-emerald-50/50 border-emerald-200 text-slate-400 line-through'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors ${
                        isDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <p className="text-xs leading-relaxed flex-1 mt-0.5">{step}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          {isCookedSuccess ? (
            <div className="w-full p-3 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span className="text-xs font-bold">
                  Meal Recorded! Inventory updated & impact points added.
                </span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-700">Estimated Impact: </span>
                Rescues ~{scaledData.wastePreventedScore * 10}g food waste & saves ~₹70.
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors"
                >
                  Close
                </button>

                <button
                  onClick={handleFinishCooking}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <ChefHat className="w-4 h-4" />
                  <span>Finish Cooking & Log Waste Saved</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
