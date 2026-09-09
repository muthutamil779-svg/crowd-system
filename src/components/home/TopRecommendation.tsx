import React from 'react';
import { useKitchen } from '../../context/KitchenContext';
import { rankRecipesByExpiryPriority } from '../../services/wasteEngine';
import { Sparkles, ChefHat, Clock, Flame, ShieldCheck, ArrowRight } from 'lucide-react';

interface TopRecommendationProps {
  onOpenRecipe: (recipeId: string) => void;
}

export const TopRecommendation: React.FC<TopRecommendationProps> = ({ onOpenRecipe }) => {
  const { recipes, inventory, setActiveTab } = useKitchen();

  const ranked = rankRecipesByExpiryPriority(recipes, inventory);
  const topMatch = ranked[0];

  if (!topMatch) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-kitchen-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 -top-12 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>AI Recommendation • Expiry-Weighted Priority</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">{topMatch.recipe.icon}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {topMatch.recipe.name}
            </h2>
          </div>

          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            {topMatch.recipe.description}
          </p>

          {/* Why Recommended Pill */}
          <div className="mt-4 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0 font-bold">
              ⭐
            </div>
            <div className="text-xs">
              <span className="font-semibold text-amber-200">Why cook this first? </span>
              <span className="text-slate-200">{topMatch.whyRecommended}</span>
              <span className="block text-emerald-300 font-medium mt-0.5">
                Rescues ~{topMatch.wastePreventedGrams}g of food & saves ~₹{topMatch.wastePreventedCost}.
              </span>
            </div>
          </div>

          {/* Quick Details Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{topMatch.recipe.prepTimeMinutes} mins</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{topMatch.recipe.difficulty}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>{topMatch.coveragePercent}% ingredients available</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row lg:flex-col items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => onOpenRecipe(topMatch.recipe.id)}
            className="flex-1 lg:flex-none px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02]"
          >
            <ChefHat className="w-5 h-5 text-slate-950" />
            <span>Cook This First</span>
          </button>

          <button
            onClick={() => setActiveTab('cook')}
            className="flex-1 lg:flex-none px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-2xl border border-white/20 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>See All Recipes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
