export const FACTOR_WEIGHTS = {
  soil: 0.37,
  rainfall: 0.27,
  state: 0.18,
  water: 0.18,
};
 
const WATER_LEVEL = { low: 1, medium: 2, high: 3 };
 
// Extended crop knowledge base. Ranges are approximate agronomic norms used
// only for *relative ranking* between crops, not as absolute agricultural
// guidance.
export const CROP_DATASET = [
  {
    name: 'Wheat', emoji: '🌾', season: ['Rabi'],
    soilTypes: ['Alluvial', 'Loamy', 'Clay', 'Black'],
    statesSuited: ['Uttar Pradesh', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Rajasthan', 'Bihar', 'Uttarakhand'],
    tempRange: [10, 25], rainfallRange: [350, 1000], phRange: [6, 7.5], waterNeed: 'medium',
    duration: '110-150 days', avgYield: '20-25 qtl/acre', marketPrice: 'Rs 2200/qtl',
    tips: ['Best in well-drained fertile loam/alluvial soil', 'Apply nitrogen split at tillering & flowering'],
  },
  {
    name: 'Rice', emoji: '🍚', season: ['Kharif'],
    soilTypes: ['Clay', 'Alluvial', 'Loamy'],
    statesSuited: ['West Bengal', 'Uttar Pradesh', 'Bihar', 'Punjab', 'Tamil Nadu', 'Andhra Pradesh'],
    tempRange: [20, 37], rainfallRange: [1000, 2000], phRange: [5.5, 7.5], waterNeed: 'high',
    duration: '90-150 days', avgYield: '18-22 qtl/acre', marketPrice: 'Rs 1900/qtl',
    tips: ['Needs standing water for most of the cycle', 'SRI method can cut water use significantly'],
  },
  {
    name: 'Maize', emoji: '🌽', season: ['Kharif', 'Rabi', 'Zaid'],
    soilTypes: ['Loamy', 'Sandy', 'Alluvial', 'Clay'],
    statesSuited: ['Madhya Pradesh', 'Uttar Pradesh', 'Bihar', 'Karnataka', 'Rajasthan', 'Maharashtra'],
    tempRange: [18, 32], rainfallRange: [500, 1000], phRange: [5.5, 7.5], waterNeed: 'medium',
    duration: '90-110 days', avgYield: '20-25 qtl/acre', marketPrice: 'Rs 1900/qtl',
    tips: ['Tolerant of multiple seasons', 'Needs good drainage, avoid waterlogging'],
  },
  {
    name: 'Cotton', emoji: '🌿', season: ['Kharif'],
    soilTypes: ['Black', 'Clay', 'Alluvial'],
    statesSuited: ['Gujarat', 'Maharashtra', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Andhra Pradesh', 'Karnataka'],
    tempRange: [21, 35], rainfallRange: [600, 1200], phRange: [6, 8], waterNeed: 'medium',
    duration: '150-180 days', avgYield: '8-12 qtl/acre', marketPrice: 'Rs 6500/qtl',
    tips: ['Deep black (regur) soil is ideal', 'Sensitive to waterlogging in early stages'],
  },
  {
    name: 'Sugarcane', emoji: '🎋', season: ['Kharif', 'Zaid'],
    soilTypes: ['Loamy', 'Clay', 'Alluvial'],
    statesSuited: ['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Bihar'],
    tempRange: [20, 38], rainfallRange: [1200, 2500], phRange: [6, 7.5], waterNeed: 'high',
    duration: '10-12 months', avgYield: '300-400 qtl/acre', marketPrice: 'Rs 350/qtl',
    tips: ['Deep, fertile, well-irrigated soil preferred', 'Ratoon cropping possible for 2-3 cycles'],
  },
  {
    name: 'Soybean', emoji: '🫘', season: ['Kharif'],
    soilTypes: ['Black', 'Loamy', 'Clay', 'Alluvial'],
    statesSuited: ['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Karnataka'],
    tempRange: [20, 30], rainfallRange: [600, 1000], phRange: [6, 7.5], waterNeed: 'medium',
    duration: '90-120 days', avgYield: '10-14 qtl/acre', marketPrice: 'Rs 4500/qtl',
    tips: ['Fixes atmospheric nitrogen — good rotation crop', 'Inoculate seed with Rhizobium culture'],
  },
  {
    name: 'Mustard', emoji: '🟡', season: ['Rabi'],
    soilTypes: ['Alluvial', 'Loamy', 'Sandy', 'Clay'],
    statesSuited: ['Rajasthan', 'Uttar Pradesh', 'Haryana', 'Madhya Pradesh', 'West Bengal'],
    tempRange: [10, 25], rainfallRange: [250, 700], phRange: [6, 7.5], waterNeed: 'low',
    duration: '110-140 days', avgYield: '6-8 qtl/acre', marketPrice: 'Rs 5100/qtl',
    tips: ['Tolerates dry rabi conditions well', 'Apply sulphur fertilizer for better oil content'],
  },
  {
    name: 'Chickpea (Gram)', emoji: '🟤', season: ['Rabi'],
    soilTypes: ['Loamy', 'Black', 'Clay', 'Sandy'],
    statesSuited: ['Madhya Pradesh', 'Rajasthan', 'Uttar Pradesh', 'Maharashtra', 'Karnataka'],
    tempRange: [10, 30], rainfallRange: [300, 650], phRange: [6, 8], waterNeed: 'low',
    duration: '90-120 days', avgYield: '8-10 qtl/acre', marketPrice: 'Rs 5300/qtl',
    tips: ['Needs minimal irrigation once established', 'Good nitrogen-fixing rotation crop'],
  },
  {
    name: 'Lentil', emoji: '🍲', season: ['Rabi'],
    soilTypes: ['Loamy', 'Clay', 'Alluvial'],
    statesSuited: ['Uttar Pradesh', 'Madhya Pradesh', 'Bihar', 'West Bengal'],
    tempRange: [10, 25], rainfallRange: [250, 500], phRange: [6, 7.5], waterNeed: 'low',
    duration: '90-110 days', avgYield: '5-8 qtl/acre', marketPrice: 'Rs 6200/qtl',
    tips: ['Low water requirement, ideal for light rabi irrigation', 'Avoid waterlogged fields'],
  },
  {
    name: 'Groundnut', emoji: '🥜', season: ['Kharif'],
    soilTypes: ['Sandy', 'Loamy', 'Red', 'Laterite'],
    statesSuited: ['Gujarat', 'Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'Rajasthan'],
    tempRange: [20, 30], rainfallRange: [500, 1000], phRange: [6, 7], waterNeed: 'medium',
    duration: '100-130 days', avgYield: '8-10 qtl/acre', marketPrice: 'Rs 5200/qtl',
    tips: ['Light, well-aerated sandy loam preferred', 'Good drainage helps pod development'],
  },
  {
    name: 'Bajra (Pearl Millet)', emoji: '🌾', season: ['Kharif'],
    soilTypes: ['Sandy', 'Loamy', 'Red'],
    statesSuited: ['Rajasthan', 'Gujarat', 'Haryana', 'Uttar Pradesh'],
    tempRange: [25, 35], rainfallRange: [200, 500], phRange: [6.5, 8], waterNeed: 'low',
    duration: '65-85 days', avgYield: '10-12 qtl/acre', marketPrice: 'Rs 2300/qtl',
    tips: ['Extremely drought tolerant', 'Well suited to arid, low-rainfall regions'],
  },
  {
    name: 'Sunflower', emoji: '🌻', season: ['Kharif', 'Rabi', 'Zaid'],
    soilTypes: ['Loamy', 'Sandy', 'Black', 'Alluvial'],
    statesSuited: ['Karnataka', 'Maharashtra', 'Andhra Pradesh', 'Punjab', 'Haryana'],
    tempRange: [18, 30], rainfallRange: [400, 700], phRange: [6.5, 8], waterNeed: 'medium',
    duration: '90-120 days', avgYield: '6-10 qtl/acre', marketPrice: 'Rs 6800/qtl',
    tips: ['Flexible across seasons with irrigation', 'Needs good sunlight exposure'],
  },
  {
    name: 'Turmeric', emoji: '🟠', season: ['Kharif'],
    soilTypes: ['Loamy', 'Clay', 'Red', 'Alluvial'],
    statesSuited: ['Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'West Bengal'],
    tempRange: [20, 35], rainfallRange: [1200, 2000], phRange: [5, 7.5], waterNeed: 'medium',
    duration: '210-240 days', avgYield: '25-35 qtl/acre', marketPrice: 'Rs 7000/qtl',
    tips: ['Rich, well-drained loam gives best rhizome yield', 'High-value long-duration crop'],
  },
  {
    name: 'Jowar (Sorghum)', emoji: '🌾', season: ['Kharif', 'Rabi'],
    soilTypes: ['Black', 'Red', 'Loamy', 'Clay'],
    statesSuited: ['Maharashtra', 'Karnataka', 'Madhya Pradesh', 'Andhra Pradesh'],
    tempRange: [20, 32], rainfallRange: [400, 800], phRange: [6, 8], waterNeed: 'low',
    duration: '100-115 days', avgYield: '12-15 qtl/acre', marketPrice: 'Rs 2800/qtl',
    tips: ['Drought tolerant, also valuable as fodder', 'Performs well in medium-rainfall black soil'],
  },
];
 
const bucketRainfall = (rainfall) => {
  if (rainfall < 400) return 'low';
  if (rainfall <= 900) return 'medium';
  return 'high';
};
 
/** 1.0 inside range, decays linearly the further outside it the value is. */
const rangeMatchScore = (value, [min, max]) => {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  if (value >= min && value <= max) return 1;
  const span = max - min || 1;
  const distance = value < min ? min - value : value - max;
  return Math.max(0, 1 - distance / span);
};
 
/** Case-insensitive membership match against a crop's list attribute. */
const listMatchScore = (value, list) => {
  if (!value) return null;
  const v = String(value).toLowerCase().trim();
  if (!v) return null;
  return list.some((item) => {
    const li = item.toLowerCase();
    return li === v || li.includes(v) || v.includes(li);
  }) ? 1 : 0;
};
 
const waterMatchScore = (rainfall, cropWaterNeed) => {
  if (rainfall === null || rainfall === undefined || Number.isNaN(rainfall)) return null;
  const bucket = bucketRainfall(rainfall);
  const diff = Math.abs(WATER_LEVEL[bucket] - WATER_LEVEL[cropWaterNeed]);
  return Math.max(0, 1 - diff / 2);
};
 
/**
 * Score a single crop against the user's inputs. Returns null-safe: any
 * factor the user didn't provide is simply excluded and the remaining
 * weights are re-normalized so the score always reflects 100% of whatever
 * data is actually available.
 */
export const scoreCrop = (crop, inputs) => {
  const { soilType, state, rainfall } = inputs;
 
  const factors = {
    soil: listMatchScore(soilType, crop.soilTypes),
    rainfall: rangeMatchScore(rainfall, crop.rainfallRange),
    state: listMatchScore(state, crop.statesSuited),
    water: waterMatchScore(rainfall, crop.waterNeed),
  };
 
  let weightedSum = 0;
  let totalWeight = 0;
  Object.entries(factors).forEach(([key, val]) => {
    if (val === null) return;
    weightedSum += val * FACTOR_WEIGHTS[key];
    totalWeight += FACTOR_WEIGHTS[key];
  });
 
  const score = totalWeight > 0 ? weightedSum / totalWeight : 0;
  return { crop, score, factors };
};
 
const WATER_LABEL = { low: 'Low', medium: 'Medium', high: 'High' };
 
/**
 * Rank the full crop dataset against the given form inputs and return
 * card-ready objects (matching what CropResultCard already expects).
 *
 * Season is enforced as a HARD filter here (not just a scoring factor): a
 * crop that doesn't grow in the selected season is removed from the
 * candidate pool before scoring even begins, so it can never appear in
 * results no matter how well it matches soil/rainfall/state/water. This is
 * what actually fixes out-of-season recommendations — previously season was
 * only one weighted factor among several, so a crop could still rank highly
 * by scoring well elsewhere even with a complete season mismatch.
 */
export const rankCrops = (inputs, limit = 6) => {
  const parsed = {
    soilType: inputs.soilType || null,
    season: inputs.season ? String(inputs.season).split(' ')[0] : null,
    state: inputs.state || null,
    rainfall: inputs.rainfall !== '' && inputs.rainfall !== undefined && inputs.rainfall !== null
      ? Number(inputs.rainfall) : null,
  };
 
  // Hard season filter — only applied when the user actually selected a
  // season. Comparison is case-insensitive against each crop's season list.
  const seasonEligible = parsed.season
    ? CROP_DATASET.filter((crop) =>
        crop.season.some((s) => s.toLowerCase() === parsed.season.toLowerCase())
      )
    : CROP_DATASET;
 
  return seasonEligible
    .map((crop) => scoreCrop(crop, parsed))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ crop, score }) => ({
      name: crop.name,
      emoji: crop.emoji,
      confidence: Math.round(score * 100),
      season: crop.season.join(' / '),
      waterNeed: WATER_LABEL[crop.waterNeed],
      duration: crop.duration,
      avgYield: crop.avgYield,
      marketPrice: crop.marketPrice,
      tips: crop.tips,
    }));
};