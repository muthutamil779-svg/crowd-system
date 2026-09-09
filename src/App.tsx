import React from 'react';
import { KitchenProvider, useKitchen } from './context/KitchenContext';
import { Navbar } from './components/layout/Navbar';
import { HomeView } from './components/home/HomeView';
import { ScanView } from './components/scan/ScanView';
import { CookView } from './components/cook/CookView';
import { InventoryView } from './components/inventory/InventoryView';
import { ShoppingView } from './components/shopping/ShoppingView';
import { KitchenChat } from './components/assistant/KitchenChat';
import { ImpactView } from './components/impact/ImpactView';
import { Sparkles, Heart, Leaf } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, setSelectedRecipeId } = useKitchen();

  const handleOpenRecipeFromHome = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    setActiveTab('cook');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && <HomeView onOpenRecipe={handleOpenRecipeFromHome} />}
        {activeTab === 'scan' && <ScanView />}
        {activeTab === 'cook' && <CookView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'shopping' && <ShoppingView />}
        {activeTab === 'assistant' && <KitchenChat />}
        {activeTab === 'impact' && <ImpactView />}
      </main>

      {/* Modern Hackathon Footer with USP */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-8 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 font-extrabold text-slate-800">
              <span className="text-xl">🥑</span>
              <span>SmartKitchen AI</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Smart Living
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              “Don’t ask what you can cook. Ask what you should cook first.”
              SmartKitchen AI turns your kitchen inventory into an intelligent, zero-waste cooking assistant.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600">
            <button onClick={() => setActiveTab('scan')} className="hover:text-emerald-600 transition-colors">
              Scan Food
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('cook')} className="hover:text-emerald-600 transition-colors">
              Cook This First
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('inventory')} className="hover:text-emerald-600 transition-colors">
              Pantry Shelf
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('shopping')} className="hover:text-emerald-600 transition-colors">
              Smart Shopping
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('impact')} className="hover:text-emerald-600 transition-colors">
              Impact
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <KitchenProvider>
      <AppContent />
    </KitchenProvider>
  );
}

export default App;
