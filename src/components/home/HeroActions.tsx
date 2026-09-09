import React from 'react';
import { useKitchen } from '../../context/KitchenContext';
import { Camera, ChefHat, ShoppingCart, MessageSquare, Sparkles, ArrowRight } from 'lucide-react';

export const HeroActions: React.FC = () => {
  const { setActiveTab } = useKitchen();

  const actions = [
    {
      id: 'scan',
      title: 'Scan My Food',
      subtitle: 'Snap photo or select grocery items to auto-detect ingredients & freshness',
      icon: Camera,
      gradient: 'from-emerald-500 to-teal-600',
      tag: 'AI Vision',
      tagColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'cook',
      title: 'What Should I Cook?',
      subtitle: 'Expiry-weighted recipes prioritizing ingredients close to spoiling',
      icon: ChefHat,
      gradient: 'from-amber-500 to-orange-600',
      tag: 'Zero-Waste Engine',
      tagColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'shopping',
      title: 'Smart Shopping List',
      subtitle: 'Smart restock with automatic substitute checks before buying',
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-indigo-600',
      tag: 'Auto-Restock',
      tagColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'assistant',
      title: 'Ask Kitchen AI',
      subtitle: 'Ask “Enna samaikkalam?”, report finished milk, or get culinary advice',
      icon: MessageSquare,
      gradient: 'from-purple-500 to-pink-600',
      tag: 'Voice & Tanglish',
      tagColor: 'bg-purple-100 text-purple-800'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <div
            key={act.id}
            onClick={() => setActiveTab(act.id)}
            className="group relative bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-emerald-300 shadow-soft hover:shadow-card transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            {/* Top Accent Gradient Bar */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${act.gradient}`} />

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${act.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${act.tagColor}`}>
                  {act.tag}
                </span>
              </div>

              <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-700 transition-colors">
                {act.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {act.subtitle}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-emerald-600">
              <span>Open Action</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
