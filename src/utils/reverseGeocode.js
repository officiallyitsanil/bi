/**
 * Extract city name from Google Geocoding API address_components.
 * Priority: locality → sublocality → admin level 3 → admin level 2
 */
export function extractCityFromAddressComponents(components) {
  if (!components?.length) return null;

  const priority = [
    'locality',
    'sublocality',
    'sublocality_level_1',
    'administrative_area_level_3',
    'administrative_area_level_2',
  ];

  for (const type of priority) {
    const match = components.find((c) => c.types.includes(type));
    if (match?.long_name) return match.long_name;
  }

  return null;
}

/**
 * Walk geocode results until a city name is found.
 */
export function extractCityFromGeocodeResults(results) {
  if (!results?.length) return null;

  for (const result of results) {
    const city = extractCityFromAddressComponents(result.address_components);
    if (city) return city;
  }

  return null;
}

/**
 * Reverse-geocode lat/lng to the exact city name via Google Maps API.
 * Falls back to fallbackCity when geocoding fails.
 */
export async function reverseGeocodeCity(lat, lng, fallbackCity = null) {
  const invalidFallback = (name) =>
    !name || name === 'Unknown' || name === 'India';

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (apiKey && lat != null && lng != null) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results?.length > 0) {
        const city = extractCityFromGeocodeResults(data.results);
        if (city) return city;
      }
    } catch (err) {
      console.warn('Reverse geocode failed:', err.message);
    }
  }

  if (!invalidFallback(fallbackCity)) return fallbackCity;
  return null;
}

export function getGeolocationTimeout() {
  if (typeof window === 'undefined') return 10000;
  return window.innerWidth < 768 ? 15000 : 10000;
}
