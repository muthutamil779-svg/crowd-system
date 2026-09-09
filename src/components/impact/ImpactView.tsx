import React from 'react';
import { useKitchen } from '../../context/KitchenContext';
import {
  TrendingUp,
  Leaf,
  DollarSign,
  Utensils,
  ShoppingBag,
  Sparkles,
  Award,
  Calendar,
  Info
} from 'lucide-react';
import { DisclaimerBadge } from '../layout/DisclaimerBadge';

export const ImpactView: React.FC = () => {
  const { impact } = useKitchen();

  // Metrics cards config
  const metrics = [
    {
      title: 'Sustainability Score',
      value: `${impact.sustainabilityScore}/100`,
      icon: Leaf,
      gradient: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-700',
      bgPill: 'bg-emerald-100 text-emerald-800',
      subtitle: 'Top 15% zero-waste households'
    },
    {
      title: 'Food Waste Prevented',
      value: `${impact.foodWastePreventedKg} kg`,
      icon: Sparkles,
      gradient: 'from-teal-500 to-cyan-600',
      textColor: 'text-teal-700',
      bgPill: 'bg-teal-100 text-teal-800',
      subtitle: 'Equivalent to 5.4 kg CO₂ prevented'
    },
    {
      title: 'Estimated Money Saved',
      value: `₹${impact.moneySaved}`,
      icon: DollarSign,
      gradient: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-700',
      bgPill: 'bg-amber-100 text-amber-800',
      subtitle: 'Based on average retail market cost'
    },
    {
      title: 'Ingredients Rescued',
      value: impact.ingredientsRescued,
      icon: Award,
      gradient: 'from-purple-500 to-indigo-600',
      textColor: 'text-purple-700',
      bgPill: 'bg-purple-100 text-purple-800',
      subtitle: 'Cooked before spoiling'
    },
    {
      title: 'Zero-Waste Meals Created',
      value: impact.mealsCreated,
      icon: Utensils,
      gradient: 'from-rose-500 to-pink-600',
      textColor: 'text-rose-700',
      bgPill: 'bg-rose-100 text-rose-800',
      subtitle: 'From existing inventory stock'
    },
    {
      title: 'Shopping Trips Avoided',
      value: impact.shoppingTripsAvoided,
      icon: ShoppingBag,
      gradient: 'from-blue-500 to-sky-600',
      textColor: 'text-blue-700',
      bgPill: 'bg-blue-100 text-blue-800',
      subtitle: 'By utilizing pantry substitutes'
    }
  ];

  // Category breakdown for visual representation
  const categoryBreakdown = [
    { name: 'Vegetables (Tomatoes, Greens)', percent: 45, color: 'bg-emerald-500', barColor: '#10b981' },
    { name: 'Dairy (Milk, Curd, Butter)', percent: 30, color: 'bg-amber-500', barColor: '#f59e0b' },
    { name: 'Fruits (Bananas, Lemons)', percent: 15, color: 'bg-purple-500', barColor: '#a855f7' },
    { name: 'Grains & Bakery (Bread)', percent: 10, color: 'bg-blue-500', barColor: '#3b82f6' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                  My Kitchen Impact
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Live Analytics
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Tracking your household food-waste prevention, financial savings, and sustainability score.
              </p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2 text-xs text-emerald-900 font-bold self-start sm:self-auto">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Sustainability Rating: Exemplary</span>
          </div>
        </div>
      </div>

      {/* 6 Grid Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">{m.title}</span>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${m.gradient} text-white flex items-center justify-center shadow-xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className={`text-3xl font-extrabold tracking-tight ${m.textColor}`}>
                    {m.value}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{m.subtitle}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Consistently improving this week</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-800">Weekly Waste Reduction Trend</h3>
              <p className="text-xs text-slate-400">Kilograms of food rescued each day</p>
            </div>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>

          {/* SVG Bar Chart Visualization */}
          <div className="h-48 pt-4 flex items-end justify-between gap-3 px-2 border-b border-slate-100">
            {impact.history.map((day, idx) => {
              const heightPercent = Math.min(100, Math.round((day.wastePreventedKg / 0.8) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.wastePreventedKg}kg
                  </span>
                  <div
                    className="w-full max-w-[36px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xl transition-all duration-500 group-hover:opacity-90 shadow-sm"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-xs font-semibold text-slate-600 mt-1">{day.date}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Total Logged this week: <strong>{impact.foodWastePreventedKg} kg</strong></span>
            <span className="text-emerald-700 font-bold">~₹{impact.moneySaved} Retained in Budget</span>
          </div>
        </div>

        {/* Category Breakdown Donut / Bar List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-800">Waste Prevented by Food Group</h3>
              <p className="text-xs text-slate-400">Where you are rescuing the most ingredients</p>
            </div>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="space-y-4 pt-2">
            {categoryBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="text-slate-900">{item.percent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-2 mt-4">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p>
              Your fastest spoil-risk category is <strong className="text-slate-800">Vegetables</strong>. Cooking recipes like Homestyle Tomato Egg Curry rescues high volumes before skin softening leads to bacterial decay.
            </p>
          </div>
        </div>
      </div>

      <DisclaimerBadge />
    </div>
  );
};
