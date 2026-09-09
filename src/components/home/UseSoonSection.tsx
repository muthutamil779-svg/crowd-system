import React from 'react';
import { useKitchen } from '../../context/KitchenContext';
import { AlertCircle, Clock, ChefHat, ArrowRight } from 'lucide-react';

export const UseSoonSection: React.FC = () => {
  const { inventory, setActiveTab } = useKitchen();

  const urgentItems = inventory.filter(
    (i) => i.freshnessStatus === 'use-soon' || i.freshnessStatus === 'check-food'
  );

  if (urgentItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">Use Soon</h3>
            <p className="text-xs text-slate-500">Ingredients requiring priority attention to prevent waste</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('inventory')}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          <span>View All Pantry</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {urgentItems.map((item) => {
          const isCritical = item.freshnessStatus === 'use-soon';
          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                isCritical
                  ? 'bg-rose-50/40 border-rose-200/80 hover:border-rose-300'
                  : 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{item.icon}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCritical
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isCritical ? '🔴 Use Soon' : '🟠 Check Food'}
                  </span>
                </div>

                <div className="mt-2">
                  <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                  <p className="text-xs text-slate-500">
                    {item.quantity} {item.unit} remaining
                  </p>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>~{item.estimatedShelfLifeDays} days left</span>
                </div>

                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 italic">
                  {item.freshnessReason}
                </p>
              </div>

              <button
                onClick={() => setActiveTab('cook')}
                className="mt-3 w-full py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <ChefHat className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cook With It</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
