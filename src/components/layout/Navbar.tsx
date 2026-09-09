import React, { useState } from 'react';
import { useKitchen } from '../../context/KitchenContext';
import {
  Home,
  Camera,
  ChefHat,
  PackageOpen,
  ShoppingCart,
  MessageSquareHeart,
  TrendingUp,
  Bell,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, unreadCount, impact, resetDemoData } = useKitchen();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'scan', label: 'Scan Food', icon: Camera, highlight: true },
    { id: 'cook', label: 'What to Cook', icon: ChefHat },
    { id: 'inventory', label: 'Pantry Shelf', icon: PackageOpen },
    { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
    { id: 'assistant', label: 'Ask AI', icon: MessageSquareHeart },
    { id: 'impact', label: 'My Impact', icon: TrendingUp },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand Vision */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <span className="text-xl">🥑</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-800 tracking-tight">SmartKitchen <span className="text-emerald-600">AI</span></span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 hidden sm:inline-block">
                  Smart Living
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                “Don’t ask what you can cook. Ask what you should cook first.”
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Impact Pill */}
            <div 
              onClick={() => setActiveTab('impact')}
              className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200/70 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-emerald-100/70 transition-colors"
              title="Kitchen Sustainability Metrics"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <div className="text-xs">
                <span className="text-slate-500 font-medium">Saved: </span>
                <span className="font-bold text-emerald-700">₹{impact.moneySaved}</span>
                <span className="text-slate-400 mx-1">•</span>
                <span className="font-bold text-emerald-700">{impact.foodWastePreventedKg}kg</span>
              </div>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Demo Reset Button */}
            <button
              onClick={() => {
                if (window.confirm('Reset all pantry, shopping, and impact stats back to default demo state?')) {
                  resetDemoData();
                }
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav px-2 py-1.5 pb-safe shadow-lg">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-emerald-600 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-700 font-medium'
                } ${item.highlight ? 'relative -top-2' : ''}`}
              >
                {item.highlight ? (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                ) : (
                  <Icon className="w-5 h-5 mb-0.5" />
                )}
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
