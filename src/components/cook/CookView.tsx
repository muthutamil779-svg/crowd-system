import React, { useState, useMemo } from 'react';
import { useKitchen } from '../../context/KitchenContext';
import { rankRecipesByExpiryPriority } from '../../services/wasteEngine';
import { RecipeDetailModal } from './RecipeDetailModal';
import { Recipe } from '../../types';
import {
  ChefHat,
  Sparkles,
  Clock,
  Flame,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Filter
} from 'lucide-react';
import { DisclaimerBadge } from '../layout/DisclaimerBadge';

export const CookView: React.FC = () => {
  const { recipes, inventory, selectedRecipeId, setSelectedRecipeId } = useKitchen();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeRecipeModal, setActiveRecipeModal] = useState<Recipe | null>(null);

  // If selectedRecipeId was set from notification or chat, open that modal
  React.useEffect(() => {
    if (selectedRecipeId) {
      const found = recipes.find((r) => r.id === selectedRecipeId);
      if (found) {
        setActiveRecipeModal(found);
      }
      setSelectedRecipeId(null);
    }
  }, [selectedRecipeId, recipes, setSelectedRecipeId]);

  // Rank all recipes using the Expiry-Weighted algorithm
  const rankedAnalyses = useMemo(() => {
    return rankRecipesByExpiryPriority(recipes, inventory);
  }, [recipes, inventory]);

  const filteredRecipes = useMemo(() => {
    return rankedAnalyses.filter((analysis) => {
      if (activeFilter === 'urgent') return analysis.priorityLevel === 'Urgent';
      if (activeFilter === 'fast') return analysis.recipe.prepTimeMinutes <= 12;
      if (activeFilter === 'breakfast') return analysis.recipe.category === 'Breakfast';
      if (activeFilter === 'main') return analysis.recipe.category === 'Main Course';
      return true;
    });
  }, [rankedAnalyses, activeFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                  What Should I Cook First?
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Expiry-Weighted
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                “Don’t ask what you can cook. Ask what you should cook first to prevent waste.”
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Recommendations' },
              { id: 'urgent', label: '🔴 Urgent Expiry' },
              { id: 'fast', label: '⚡ Fast (<15m)' },
              { id: 'breakfast', label: '🥞 Breakfast' },
              { id: 'main', label: '🍛 Main Course' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeFilter === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRecipes.map((analysis) => {
          const { recipe, priorityLevel, whyRecommended, coveragePercent, wastePreventedGrams } =
            analysis;
          const isUrgent = priorityLevel === 'Urgent';

          return (
            <div
              key={recipe.id}
              className={`bg-white rounded-3xl border overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between group ${
                isUrgent ? 'border-amber-300/80 ring-1 ring-amber-300/40' : 'border-slate-200/80'
              }`}
            >
              <div>
                {/* Image & Badges */}
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs backdrop-blur-md ${
                        isUrgent
                          ? 'bg-rose-500/90 text-white'
                          : 'bg-emerald-600/90 text-white'
                      }`}
                    >
                      {isUrgent ? '🔴 Urgent Priority' : '⭐ Recommended'}
                    </span>

                    <span className="text-xl p-1 bg-white/80 backdrop-blur-md rounded-xl shadow-xs">
                      {recipe.icon}
                    </span>
                  </div>

                  {/* Title on Image overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                      {recipe.category} • {recipe.cuisine}
                    </p>
                    <h3 className="font-bold text-base sm:text-lg leading-tight drop-shadow-sm">
                      {recipe.name}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3">
                  {/* Why Recommended Pill */}
                  <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs">
                    <p className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>{whyRecommended}</span>
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Rescues ~{wastePreventedGrams}g from food waste.
                    </p>
                  </div>

                  {/* Pantry Coverage Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>Pantry Ingredient Match</span>
                      <span
                        className={
                          coveragePercent >= 75
                            ? 'text-emerald-700 font-bold'
                            : 'text-amber-700 font-bold'
                        }
                      >
                        {coveragePercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          coveragePercent >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${coveragePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta Chips */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{recipe.prepTimeMinutes} mins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-slate-400" />
                      <span>{recipe.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium text-emerald-700">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Serves {recipe.baseServings}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => setActiveRecipeModal(recipe)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all duration-200"
                >
                  <ChefHat className="w-4 h-4" />
                  <span>Cook & Scale Portions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <DisclaimerBadge />

      {/* Recipe Detail Modal */}
      {activeRecipeModal && (
        <RecipeDetailModal
          recipe={activeRecipeModal}
          onClose={() => setActiveRecipeModal(null)}
        />
      )}
    </div>
  );
};
