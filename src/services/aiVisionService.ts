import { DetectedFoodItem } from '../types';

export interface SampleScanPreset {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  detectedItems: DetectedFoodItem[];
}

export const sampleScanPresets: SampleScanPreset[] = [
  {
    id: 'sample-fridge-counter',
    name: 'Countertop & Fresh Goods',
    thumbnail: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
    description: 'Fresh haul containing ripe tomatoes, bananas, eggs, and opened milk carton.',
    detectedItems: [
      {
        name: 'Tomato',
        category: 'Vegetables',
        quantity: 3,
        unit: 'pcs',
        confidence: 96,
        estimatedShelfLifeDays: 1.5,
        freshnessStatus: 'use-soon',
        visualIndicators: ['Softening on base', 'Deep red skin pigmentation', 'Ripe blossom scar'],
        reason: 'Slight softening detected at base. Approaching peak ripeness (~1–2 days).',
        storageRecommendation: 'Countertop',
        icon: '🍅',
        estimatedCostValue: 35
      },
      {
        name: 'Banana',
        category: 'Fruits',
        quantity: 2,
        unit: 'pcs',
        confidence: 98,
        estimatedShelfLifeDays: 2.5,
        freshnessStatus: 'check-food',
        visualIndicators: ['Freckled brown peel spots', 'Soft stem curve'],
        reason: 'Sugar spots visible. Ideal for smoothies, baking, or immediate consumption.',
        storageRecommendation: 'Countertop',
        icon: '🍌',
        estimatedCostValue: 20
      },
      {
        name: 'Milk',
        category: 'Dairy',
        quantity: 1.5,
        unit: 'cups',
        confidence: 91,
        estimatedShelfLifeDays: 1,
        freshnessStatus: 'use-soon',
        visualIndicators: ['Opened seal detected', 'Liquid level ~360ml'],
        reason: 'Opened container detected. Prioritize consuming within 24-48 hours.',
        storageRecommendation: 'Refrigerator',
        icon: '🥛',
        estimatedCostValue: 35
      },
      {
        name: 'Eggs',
        category: 'Protein',
        quantity: 4,
        unit: 'pcs',
        confidence: 95,
        estimatedShelfLifeDays: 10,
        freshnessStatus: 'fresh',
        visualIndicators: ['Intact white shells', 'No hairline fissures'],
        reason: 'Pristine shells. Estimated fresh for ~10-14 days refrigerated.',
        storageRecommendation: 'Refrigerator',
        icon: '🥚',
        estimatedCostValue: 32
      }
    ]
  },
  {
    id: 'sample-crisper-greens',
    name: 'Vegetable Crisper Bin',
    thumbnail: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80',
    description: 'Leafy spinach bunch with whole potatoes and sweet red onions.',
    detectedItems: [
      {
        name: 'Spinach',
        category: 'Vegetables',
        quantity: 1,
        unit: 'bunch',
        confidence: 94,
        estimatedShelfLifeDays: 2,
        freshnessStatus: 'check-food',
        visualIndicators: ['Edges slight wilting', 'Deep green moisture content'],
        reason: 'Tender greens drying out slightly at tips. Cook within 48h.',
        storageRecommendation: 'Refrigerator',
        icon: '🥬',
        estimatedCostValue: 40
      },
      {
        name: 'Potato',
        category: 'Vegetables',
        quantity: 4,
        unit: 'pcs',
        confidence: 97,
        estimatedShelfLifeDays: 15,
        freshnessStatus: 'fresh',
        visualIndicators: ['Firm surface', 'Zero sprout eyes'],
        reason: 'Sturdy pantry condition. Store in cool, dark pantry.',
        storageRecommendation: 'Pantry',
        icon: '🥔',
        estimatedCostValue: 40
      },
      {
        name: 'Onion',
        category: 'Vegetables',
        quantity: 3,
        unit: 'pcs',
        confidence: 96,
        estimatedShelfLifeDays: 12,
        freshnessStatus: 'fresh',
        visualIndicators: ['Crisp papery skin', 'Firm core'],
        reason: 'Good dry storage condition. Safe for ~2 weeks.',
        storageRecommendation: 'Pantry',
        icon: '🧅',
        estimatedCostValue: 35
      }
    ]
  },
  {
    id: 'sample-pantry-fruits',
    name: 'Pantry & Fruit Basket',
    thumbnail: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
    description: 'Bread loaf slices, lemons, and golden bananas.',
    detectedItems: [
      {
        name: 'Bread Slices',
        category: 'Grains',
        quantity: 4,
        unit: 'slices',
        confidence: 92,
        estimatedShelfLifeDays: 2,
        freshnessStatus: 'check-food',
        visualIndicators: ['Slight crust drying', 'No mold colonies'],
        reason: 'Bread crust is beginning to lose moisture. Use for toast or pudding.',
        storageRecommendation: 'Countertop',
        icon: '🍞',
        estimatedCostValue: 20
      },
      {
        name: 'Lemon',
        category: 'Fruits',
        quantity: 2,
        unit: 'pcs',
        confidence: 97,
        estimatedShelfLifeDays: 7,
        freshnessStatus: 'fresh',
        visualIndicators: ['Bright yellow zest', 'Plump firm skin'],
        reason: 'Firm and juicy. Good acidity retention.',
        storageRecommendation: 'Refrigerator',
        icon: '🍋',
        estimatedCostValue: 20
      }
    ]
  }
];

export interface ScanVisionResponse {
  detectedItems: DetectedFoodItem[];
  overallSummary: string;
  confidenceScore: number;
  aiTimestamp: string;
  disclaimer: string;
}

/**
 * AI Vision Service abstraction.
 * Currently simulates high-fidelity multimodal computer vision analysis with realistic latencies,
 * and is architected to seamlessly attach real Vision API endpoints (e.g. Gemini 1.5 Flash / Pro).
 */
export async function analyzeFoodImage(
  _imageSource: File | string,
  presetId?: string
): Promise<ScanVisionResponse> {
  // Simulate network & neural processing delay (1.4s)
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const preset = sampleScanPresets.find((p) => p.id === presetId) || sampleScanPresets[0];

  return {
    detectedItems: preset.detectedItems,
    overallSummary: `Successfully recognized ${preset.detectedItems.length} ingredients with high visual confidence. AI identified ${
      preset.detectedItems.filter((i) => i.freshnessStatus === 'use-soon').length
    } item(s) that should be prioritized for zero-waste cooking.`,
    confidenceScore: 95.4,
    aiTimestamp: new Date().toISOString(),
    disclaimer:
      'AI shelf-life and freshness statuses are automated estimates based on visual features. Manufacturer expiration dates and standard kitchen hygiene standards always take priority.'
  };
}
