export const getTrend = (crop = 'Crop') => {
  const safeCrop = crop || 'Crop';
  const seed = (safeCrop.charCodeAt(0) + safeCrop.charCodeAt(safeCrop.length - 1 || 0)) % 7 - 3;
  const val = seed === 0 ? 1.5 : seed * 1.2;
  return {
    value: Math.abs(val).toFixed(1) + '%',
    isUp: val >= 0,
    signedValue: val,
  };
};
 
export const getArrivals = (crop = 'Crop') => {
  const safeCrop = crop || 'Crop';
  const seed = (safeCrop.charCodeAt(1) || 5) * 7 % 450 + 80;
  return seed;
};