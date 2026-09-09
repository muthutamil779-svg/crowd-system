import { FreshnessStatus, FoodCategory, StorageType } from '../types';

export interface FreshnessAssessment {
  status: FreshnessStatus;
  estimatedShelfLifeDays: number;
  reason: string;
  storageTip: string;
  wasteUrgencyScore: number; // 0 (low) - 100 (critical)
}

export function assessFreshness(
  category: FoodCategory,
  daysStored: number,
  storageType: StorageType,
  hasOpened: boolean = false
): FreshnessAssessment {
  let estimatedDays = 5;
  let status: FreshnessStatus = 'fresh';
  let reason = 'Appears fresh based on standard pantry metrics.';
  let storageTip = 'Keep in a cool, ventilated location.';

  switch (category) {
    case 'Vegetables':
      if (storageType === 'Refrigerator') {
        estimatedDays = Math.max(0.5, 7 - daysStored);
        storageTip = 'Keep wrapped in breathable produce bags to prevent condensation.';
      } else {
        estimatedDays = Math.max(0.5, 4 - daysStored);
        storageTip = 'Keep away from direct sunlight and ethylene-producing fruits.';
      }
      break;

    case 'Fruits':
      estimatedDays = Math.max(0.5, 5 - daysStored);
      storageTip = 'Separate ripe bananas and apples as their ethylene gas speeds up nearby fruit ripening.';
      break;

    case 'Dairy':
      if (hasOpened) {
        estimatedDays = Math.max(0.5, 3 - daysStored);
        reason = 'Opened dairy products oxidise and absorb surrounding odors rapidly.';
      } else {
        estimatedDays = Math.max(1, 10 - daysStored);
      }
      storageTip = 'Store in the main refrigerator body, not on the warmer door shelf.';
      break;

    case 'Grains':
      estimatedDays = Math.max(1, 14 - daysStored);
      storageTip = 'Store in airtight glass or BPA-free containers with a dry bay leaf to deter weevils.';
      break;

    case 'Protein':
      estimatedDays = Math.max(1, 12 - daysStored);
      storageTip = 'Keep eggs in their original carton on the middle shelf to maintain moisture balance.';
      break;

    default:
      estimatedDays = Math.max(1, 7 - daysStored);
      storageTip = 'Seal container tightly after each use.';
  }

  if (estimatedDays <= 0) {
    status = 'past-date';
    reason = 'Exceeded standard shelf-life window. Inspect carefully before using.';
  } else if (estimatedDays <= 1.5) {
    status = 'use-soon';
    reason = 'Approaching optimal consumption window. Prioritize cooking within 24–36 hours.';
  } else if (estimatedDays <= 3) {
    status = 'check-food';
    reason = 'Noticeable ripeness or slight dehydration. Inspect and plan for cooking this week.';
  } else {
    status = 'fresh';
    reason = 'Good crispness and structural integrity. Stable shelf life remaining.';
  }

  const wasteUrgencyScore =
    status === 'past-date' ? 100 : status === 'use-soon' ? 95 : status === 'check-food' ? 65 : 20;

  return {
    status,
    estimatedShelfLifeDays: Math.round(estimatedDays * 10) / 10,
    reason,
    storageTip,
    wasteUrgencyScore
  };
}

export const FOOD_SAFETY_DISCLAIMER =
  'Important Notice: SmartKitchen AI shelf-life ratings are algorithmically generated estimates to encourage zero-waste pantry management. Always rely on official manufacturer expiration dates, sensory safety checks (smell, mold, sourness), and food-safety best practices.';
