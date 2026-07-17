const EARTH_RADIUS_KM = 6371;
const INDIA_CENTROID = { lat: 22.9734, lng: 78.6569 };
 
// Coarse state-level centroids (fallback when a district isn't in DISTRICT_CENTROIDS)
export const STATE_CENTROIDS = {
  'Rajasthan': { lat: 27.0238, lng: 74.2179 },
  'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 },
  'Haryana': { lat: 29.0588, lng: 76.0856 },
  'Madhya Pradesh': { lat: 22.9734, lng: 78.6569 },
  'Gujarat': { lat: 22.2587, lng: 71.1924 },
  'Maharashtra': { lat: 19.7515, lng: 75.7139 },
  'Punjab': { lat: 31.1471, lng: 75.3412 },
  'Bihar': { lat: 25.0961, lng: 85.3131 },
  'West Bengal': { lat: 22.9868, lng: 87.8550 },
  'Karnataka': { lat: 15.3173, lng: 75.7139 },
  'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
  'Andhra Pradesh': { lat: 15.9129, lng: 79.7400 },
  'Telangana': { lat: 18.1124, lng: 79.0193 },
  'Kerala': { lat: 10.8505, lng: 76.2711 },
  'Odisha': { lat: 20.9517, lng: 85.0985 },
  'Assam': { lat: 26.2006, lng: 92.9376 },
  'Chhattisgarh': { lat: 21.2787, lng: 81.8661 },
  'Jharkhand': { lat: 23.6102, lng: 85.2799 },
};
 
// Known district centroids. Includes the app's demo "hub" districts plus
// their real neighbouring districts, so Nearby Mandis can genuinely expand
// across district borders (not just list mandis within one district).
// Coordinates are approximate district-town centroids, not district-boundary
// polygons — precise enough for relative "nearest neighbour" ranking.
// Anything not listed here gracefully falls back to its state centroid.
export const DISTRICT_CENTROIDS = {
  // Rajasthan
  'Rajasthan|Sikar': { lat: 27.6094, lng: 75.1399 },
  'Rajasthan|Jaipur': { lat: 26.9124, lng: 75.7873 },
  'Rajasthan|Bharatpur': { lat: 27.2152, lng: 77.4900 },
  'Rajasthan|Jhunjhunu': { lat: 28.1300, lng: 75.4000 },
  'Rajasthan|Churu': { lat: 28.2950, lng: 74.9650 },
  'Rajasthan|Nagaur': { lat: 27.2000, lng: 73.7300 },
  'Rajasthan|Alwar': { lat: 27.5665, lng: 76.6250 },
  'Rajasthan|Dausa': { lat: 26.8900, lng: 76.3350 },
  'Rajasthan|Dholpur': { lat: 26.7000, lng: 77.9000 },
  'Rajasthan|Karauli': { lat: 26.5000, lng: 77.0300 },
 
  // Uttar Pradesh
  'Uttar Pradesh|Auraiya': { lat: 26.4649, lng: 79.5157 },
  'Uttar Pradesh|Etawah': { lat: 26.7855, lng: 79.0154 },
  'Uttar Pradesh|Kannauj': { lat: 27.0700, lng: 79.9200 },
  'Uttar Pradesh|Kanpur Dehat': { lat: 26.4880, lng: 79.9850 },
  'Uttar Pradesh|Farrukhabad': { lat: 27.3900, lng: 79.5800 },
  'Uttar Pradesh|Mainpuri': { lat: 27.2350, lng: 79.0270 },
 
  // Haryana
  'Haryana|Karnal': { lat: 29.6857, lng: 76.9905 },
  'Haryana|Kurukshetra': { lat: 29.9695, lng: 76.8783 },
  'Haryana|Panipat': { lat: 29.3909, lng: 76.9635 },
  'Haryana|Kaithal': { lat: 29.8000, lng: 76.4000 },
 
  // Madhya Pradesh
  'Madhya Pradesh|Indore': { lat: 22.7196, lng: 75.8577 },
  'Madhya Pradesh|Dewas': { lat: 22.9623, lng: 76.0553 },
  'Madhya Pradesh|Ujjain': { lat: 23.1793, lng: 75.7849 },
  'Madhya Pradesh|Dhar': { lat: 22.6000, lng: 75.3000 },
 
  // Gujarat
  'Gujarat|Rajkot': { lat: 22.3039, lng: 70.8022 },
  'Gujarat|Jamnagar': { lat: 22.4707, lng: 70.0577 },
  'Gujarat|Junagadh': { lat: 21.5222, lng: 70.4579 },
  'Gujarat|Surendranagar': { lat: 22.7250, lng: 71.6380 },
  'Gujarat|Morbi': { lat: 22.8173, lng: 70.8378 },
 
  // Maharashtra
  'Maharashtra|Nashik': { lat: 20.0110, lng: 73.7903 },
  'Maharashtra|Dhule': { lat: 20.9042, lng: 74.7749 },
  'Maharashtra|Ahmednagar': { lat: 19.0948, lng: 74.7480 },
  'Maharashtra|Chhatrapati Sambhajinagar': { lat: 19.8762, lng: 75.3433 },
};
 
const hashString = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};
 
/**
 * Find the `count` nearest *districts* (by real centroid distance) to a given
 * state+district — used to pull neighbouring-district mandis into Nearby
 * Mandis instead of stopping at the selected district's border.
 * Returns [] if the origin district isn't in our known centroid table
 * (degrades gracefully rather than guessing).
 */
export const getNearestDistricts = (state, district, count = 3) => {
  const originKey = `${state}|${district}`;
  const origin = DISTRICT_CENTROIDS[originKey];
  if (!origin) return [];
 
  return Object.entries(DISTRICT_CENTROIDS)
    .filter(([key]) => key !== originKey)
    .map(([key, coords]) => {
      const [st, dist] = key.split('|');
      return { state: st, district: dist, distanceKm: haversineDistanceKm(origin, coords) };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, count);
};
 
/**
 * Resolve an approximate lat/lng for a mandi from its state + district,
 * nudged deterministically by the mandi's own name.
 */
export const resolveMandiLocation = (state, district, mandiName) => {
  const key = `${state}|${district}`;
  const base = DISTRICT_CENTROIDS[key] || STATE_CENTROIDS[state] || INDIA_CENTROID;
 
  const hash = hashString(mandiName || '');
  const angle = (hash % 360) * (Math.PI / 180);
  const spreadDeg = 0.05 + (hash % 100) / 2000; // ~5-12 km spread within the district
 
  return {
    lat: base.lat + spreadDeg * Math.cos(angle),
    lng: base.lng + spreadDeg * Math.sin(angle),
  };
};
 
/** Great-circle distance between two {lat,lng} points, in km. */
export const haversineDistanceKm = (a, b) => {
  if (!a || !b || typeof a.lat !== 'number' || typeof b.lat !== 'number') return null;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_KM * c;
};