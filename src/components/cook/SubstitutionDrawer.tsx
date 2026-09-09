import React from 'react';
import { Substitution } from '../../types';
import { Sparkles, Check, ShoppingCart, AlertCircle, ArrowRight } from 'lucide-react';
import { useKitchen } from '../../context/KitchenContext';

interface SubstitutionDrawerProps {
  substitution: Substitution;
  onApplySubstitute: (sub: Substitution) => void;
  onAddMissingToShoppingList: (name: string, qty: number, unit: string) => void;
}

export const SubstitutionDrawer: React.FC<SubstitutionDrawerProps> = ({
  substitution,
  onApplySubstitute,
  onAddMissingToShoppingList
}) => {
  const { addShoppingItem } = useKitchen();

  return (
    <div className="bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-yellow-50/50 border border-amber-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              AI Smart Substitution
            </span>
            <p className="text-xs font-semibold text-slate-800">
              Missing {substitution.originalIngredient}? Don’t rush to buy!
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
          {substitution.confidence}% culinary match
        </span>
      </div>

      {/* Suggested Swap Formula */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-amber-200/80 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <span className="text-slate-500 line-through">{substitution.originalIngredient}</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-emerald-700 font-bold">{substitution.substituteName}</span>
        </div>
        <p className="text-[11px] text-slate-600 mt-1 font-medium">
          Ratio: <span className="font-semibold text-slate-800">{substitution.ratio}</span>
        </p>
        <p className="text-[11px] text-slate-500 mt-1 italic">
          💡 {substitution.culinaryReason}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={() => onApplySubstitute(substitution)}
          className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Use Substitute</span>
        </button>

        <button
          onClick={() => {
            addShoppingItem(substitution.originalIngredient, 1, 'item', 'Original recipe request');
            onAddMissingToShoppingList(substitution.originalIngredient, 1, 'item');
          }}
          className="flex-1 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
        >
          <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
          <span>Buy Original Instead</span>
        </button>
      </div>
    </div>
  );
};
