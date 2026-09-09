import React from 'react';
import { HeroActions } from './HeroActions';
import { UseSoonSection } from './UseSoonSection';
import { TopRecommendation } from './TopRecommendation';
import { DisclaimerBadge } from '../layout/DisclaimerBadge';
import { Sparkles, Leaf, TrendingUp } from 'lucide-react';
import { useKitchen } from '../../context/KitchenContext';

interface HomeViewProps {
  onOpenRecipe: (recipeId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onOpenRecipe }) => {
  const { impact } = useKitchen();

  // Dynamic greeting based on user's local hour
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Greeting & Hackathon USP */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-warm-50 p-6 rounded-3xl border border-emerald-100/60 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              {greeting} <span className="inline-block animate-bounce">👋</span>
            </h1>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            What can I help with today in your kitchen?
          </p>
        </div>

        {/* Core Vision Badge */}
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-200/70 px-4 py-2.5 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Leaf className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-slate-800 block">Smart Living Vision</span>
            <span className="text-emerald-700 font-medium">
              Zero-Waste • Save Money • Easy Cooking
            </span>
          </div>
        </div>
      </div>

      {/* 4 Large Action Cards */}
      <HeroActions />

      {/* Expiry Priority Cook This First Recommendation */}
      <TopRecommendation onOpenRecipe={onOpenRecipe} />

      {/* Urgent Ingredients Section */}
      <UseSoonSection />

      {/* Quick Impact Highlight Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">Your Kitchen Impact Score: {impact.sustainabilityScore}/100</h4>
            <p className="text-xs text-slate-500">
              You’ve prevented {impact.foodWastePreventedKg}kg of food waste and saved ~₹{impact.moneySaved} so far!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{impact.ingredientsRescued} Ingredients Rescued</span>
        </div>
      </div>

      {/* Regulatory & Food Safety AI Notice */}
      <DisclaimerBadge />
    </div>
  );
};
