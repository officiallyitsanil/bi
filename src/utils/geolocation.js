import { reverseGeocodeCity, getGeolocationTimeout } from './reverseGeocode';

/**
 * Get user's location using browser geolocation API (with permission)
 * or fallback to IP-based geolocation. City is always resolved from
 * coordinates via reverse geocoding when possible.
 */
export async function getUserLocation() {
  const fetchIPLocation = async (url) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('IP location request timed out');
      } else {
        console.warn('IP location request failed:', error.message);
      }
      return null;
    }
  };

  const getIPFallback = async () => {
    const ipApis = [
      'https://ipapi.co/json/',
      'https://freeipapi.com/api/json',
      'https://ipwho.is/',
    ];

    let ipLocation = null;

    try {
      const response = await fetch('/api/geolocate');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          ipLocation = result.data;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch from same-origin geolocate proxy:', err.message);
    }

    if (!ipLocation) {
      for (const apiUrl of ipApis) {
        try {
          const ipData = await fetchIPLocation(apiUrl);
          if (!ipData) continue;

          let lat, lng, city, country;

          if (apiUrl.includes('ipapi.co')) {
            lat = ipData.latitude;
            lng = ipData.longitude;
            city = ipData.city;
            country = ipData.country_name;
          } else if (apiUrl.includes('freeipapi.com')) {
            lat = ipData.latitude;
            lng = ipData.longitude;
            city = ipData.cityName;
            country = ipData.countryName;
          } else if (apiUrl.includes('ipwho.is')) {
            lat = ipData.latitude;
            lng = ipData.longitude;
            city = ipData.city;
            country = ipData.country;
          }

          if (lat && lng) {
            ipLocation = {
              lat: parseFloat(lat),
              lng: parseFloat(lng),
              city: city || 'Unknown',
              country: country || 'Unknown',
              isApproximate: true,
            };
            break;
          }
        } catch (error) {
          console.warn(`Failed to fetch from ${apiUrl}:`, error);
        }
      }
    }

    if (ipLocation) {
      const resolvedCity = await reverseGeocodeCity(
        ipLocation.lat,
        ipLocation.lng,
        ipLocation.city,
        true
      );
      if (resolvedCity) ipLocation.city = resolvedCity;
    }

    return ipLocation;
  };

  const geoTimeout = getGeolocationTimeout();

  if (typeof window !== 'undefined' && navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: geoTimeout,
          maximumAge: 0,
        });
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const city = await reverseGeocodeCity(lat, lng);

      return {
        lat,
        lng,
        city: city || undefined,
        isApproximate: false,
        accuracy: position.coords.accuracy,
      };
    } catch (error) {
      console.warn('Browser geolocation failed or timed out, trying IP fallback:', error.message);
    }
  }

  const ipLocation = await getIPFallback();
  if (ipLocation) {
    return ipLocation;
  }

  return {
    lat: 20.5937,
    lng: 78.9629,
    city: 'India',
    country: 'India',
    isApproximate: true,
    isFallback: true,
  };
}
