import React, { useState } from 'react';
import { useKitchen } from '../../context/KitchenContext';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Clock,
  Trash2,
  Plus,
  ArrowRight,
  RefreshCw,
  Eye,
  Info
} from 'lucide-react';
import {
  sampleScanPresets,
  analyzeFoodImage,
  SampleScanPreset
} from '../../services/aiVisionService';
import { DetectedFoodItem, Ingredient, FreshnessStatus } from '../../types';
import { DisclaimerBadge } from '../layout/DisclaimerBadge';

export const ScanView: React.FC = () => {
  const { addIngredients, setActiveTab } = useKitchen();

  const [selectedPreset, setSelectedPreset] = useState<SampleScanPreset>(sampleScanPresets[0]);
  const [imagePreview, setImagePreview] = useState<string>(sampleScanPresets[0].thumbnail);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [detectedItems, setDetectedItems] = useState<DetectedFoodItem[] | null>(null);
  const [overallSummary, setOverallSummary] = useState<string>('');
  const [isAddedSuccess, setIsAddedSuccess] = useState<boolean>(false);

  // Handle Preset Select
  const handleSelectPreset = (preset: SampleScanPreset) => {
    setSelectedPreset(preset);
    setImagePreview(preset.thumbnail);
    setDetectedItems(null);
    setIsAddedSuccess(false);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setDetectedItems(null);
      setIsAddedSuccess(false);
    }
  };

  // Run AI Scan
  const handleStartScan = async () => {
    setIsScanning(true);
    setScanProgress(15);
    setIsAddedSuccess(false);

    const timer = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(timer);
          return 95;
        }
        return prev + 25;
      });
    }, 300);

    try {
      const result = await analyzeFoodImage(imagePreview, selectedPreset.id);
      clearInterval(timer);
      setScanProgress(100);
      setDetectedItems(result.detectedItems);
      setOverallSummary(result.overallSummary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  // Edit item quantity
  const handleUpdateItem = (idx: number, updates: Partial<DetectedFoodItem>) => {
    if (!detectedItems) return;
    const copy = [...detectedItems];
    copy[idx] = { ...copy[idx], ...updates };
    setDetectedItems(copy);
  };

  // Remove detected item
  const handleRemoveItem = (idx: number) => {
    if (!detectedItems) return;
    setDetectedItems(detectedItems.filter((_, i) => i !== idx));
  };

  // Add new detected item row
  const handleAddNewItem = () => {
    if (!detectedItems) return;
    const newItem: DetectedFoodItem = {
      name: 'Custom Ingredient',
      category: 'Vegetables',
      quantity: 1,
      unit: 'pcs',
      confidence: 100,
      estimatedShelfLifeDays: 5,
      freshnessStatus: 'fresh',
      visualIndicators: ['User manual entry'],
      reason: 'Added manually via scanner confirmation.',
      storageRecommendation: 'Countertop',
      icon: '🥗',
      estimatedCostValue: 20
    };
    setDetectedItems([...detectedItems, newItem]);
  };

  // Confirm and Add to Inventory
  const handleConfirmAndAdd = () => {
    if (!detectedItems || detectedItems.length === 0) return;

    const newIngredients: Ingredient[] = detectedItems.map((item) => ({
      id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      purchaseDate: new Date().toISOString().split('T')[0],
      estimatedShelfLifeDays: item.estimatedShelfLifeDays,
      freshnessStatus: item.freshnessStatus,
      freshnessReason: item.reason,
      storageType: item.storageRecommendation,
      icon: item.icon,
      estimatedCostValue: item.estimatedCostValue,
      estimatedGrams: item.unit === 'pcs' ? item.quantity * 100 : item.quantity * 250
    }));

    addIngredients(newIngredients);
    setIsAddedSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                Scan Your Food
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Snap or upload groceries. AI identifies ingredients, counts quantities & estimates shelf-life.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Multimodal Vision Ready</span>
          </div>
        </div>
      </div>

      {/* Main Scanner Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-6">
        {/* Step 1: Demo Sample Presets for Instant Testing */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            1. Select Demo Food Scene or Upload Your Own:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sampleScanPresets.map((preset) => {
              const isSelected = selectedPreset.id === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                      : 'border-slate-100 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <img
                    src={preset.thumbnail}
                    alt={preset.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-800 truncate">{preset.name}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{preset.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Viewfinder Preview Box with Scanning Radar */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video max-h-[360px] flex items-center justify-center group border border-slate-800">
          <img
            src={imagePreview}
            alt="Food item to scan"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isScanning ? 'opacity-70 blur-[1px]' : 'opacity-90'
            }`}
          />

          {/* AI Scanning Overlay Effect */}
          {isScanning && (
            <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-white text-center">
              {/* Animated Laser Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan-line" />

              <div className="w-16 h-16 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin mb-4" />
              <p className="font-bold text-base tracking-wide">Analyzing Visual Freshness...</p>
              <p className="text-xs text-emerald-200 mt-1">
                Detecting softening, pigmentation, brown spots & item boundaries ({scanProgress}%)
              </p>
            </div>
          )}

          {/* Idle Camera / Upload Controls */}
          {!isScanning && !detectedItems && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 bg-slate-950/70 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <label className="cursor-pointer text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Upload Custom Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleStartScan}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>Scan with AI Vision</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Button if not yet scanned */}
        {!detectedItems && !isScanning && (
          <div className="flex justify-center">
            <button
              onClick={handleStartScan}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Camera className="w-5 h-5" />
              <span>Analyze Scene with Kitchen Vision AI</span>
            </button>
          </div>
        )}

        {/* Step 2: Detected Ingredients List & Freshness Breakdown */}
        {detectedItems && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Detected Ingredients ({detectedItems.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Confirm or edit quantities before updating your pantry inventory.
                </p>
              </div>

              <button
                onClick={handleAddNewItem}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {/* AI Summary Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
              <span className="font-bold">AI Vision Assessment: </span>
              {overallSummary}
            </div>

            {/* Item Rows */}
            <div className="space-y-2.5">
              {detectedItems.map((item, idx) => {
                const isUrgent = item.freshnessStatus === 'use-soon';
                const isCheck = item.freshnessStatus === 'check-food';

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isUrgent
                        ? 'bg-rose-50/30 border-rose-200'
                        : isCheck
                        ? 'bg-amber-50/30 border-amber-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Ingredient Name & Icon */}
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-1 bg-white rounded-xl shadow-xs border border-slate-100">
                          {item.icon}
                        </span>
                        <div>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(idx, { name: e.target.value })}
                            className="font-bold text-sm text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-emerald-600"
                          />
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isUrgent
                                  ? 'bg-rose-100 text-rose-800'
                                  : isCheck
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isUrgent ? '🔴 Use Soon' : isCheck ? '🟠 Check Food' : '🟢 Fresh'}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              ~{item.estimatedShelfLifeDays} days remaining
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Visual Condition Explanations */}
                      <div className="flex-1 max-w-sm text-xs text-slate-600">
                        <p className="font-medium text-slate-700 flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>AI Visual Indicators:</span>
                        </p>
                        <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">
                          {item.visualIndicators?.join(' • ') || item.reason}
                        </p>
                      </div>

                      {/* Quantity & Unit Controls */}
                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 py-1">
                          <input
                            type="number"
                            min="0.1"
                            step="0.5"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(idx, { quantity: parseFloat(e.target.value) || 1 })
                            }
                            className="w-12 text-sm font-bold text-center focus:outline-none"
                          />
                          <span className="text-xs text-slate-500 font-medium ml-1">
                            {item.unit}
                          </span>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Confirmation Banner or Success State */}
            {isAddedSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-700" />
                  <span className="font-bold text-sm">
                    Success! Added {detectedItems.length} items to your kitchen pantry.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('cook')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    <span>What Should I Cook?</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl border border-emerald-300"
                  >
                    View Pantry
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
                <button
                  onClick={handleStartScan}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Rescan Scene</span>
                </button>

                <button
                  onClick={handleConfirmAndAdd}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirm & Add to Inventory</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <DisclaimerBadge />
    </div>
  );
};
