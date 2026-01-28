/**
 * Get user's location using browser geolocation API (with permission)
 * or fallback to IP-based geolocation
 */
export async function getUserLocation() {
  // Helper function to fetch IP location with timeout and error handling
  const fetchIPLocation = async (url) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('IP location request timed out');
      } else {
        console.warn('IP location request failed:', error.message);
      }
      return null;
    }
  };

  // Try multiple IP geolocation APIs as fallbacks
  const ipApis = [
    'https://ipapi.co/json/',
    'https://ip-api.com/json/',
    'https://api.ipify.org?format=json'
  ];

  let ipLocation = null;
  
  // Try IP-based location (no permission needed)
  for (const apiUrl of ipApis) {
    try {
      let ipData;
      
      if (apiUrl.includes('ipify')) {
        // ipify only returns IP, skip it for now
        continue;
      }
      
      ipData = await fetchIPLocation(apiUrl);
      
      if (ipData) {
        // Handle different API response formats
        let lat, lng, city, country;
        
        if (apiUrl.includes('ipapi.co')) {
          lat = ipData.latitude;
          lng = ipData.longitude;
          city = ipData.city;
          country = ipData.country_name;
        } else if (apiUrl.includes('ip-api.com')) {
          lat = ipData.lat;
          lng = ipData.lon;
          city = ipData.city;
          country = ipData.country;
        }
        
        if (lat && lng) {
          ipLocation = {
            lat,
            lng,
            city: city || 'Unknown',
            country: country || 'Unknown',
            isApproximate: true
          };
          break; // Success, exit loop
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${apiUrl}:`, error);
      continue; // Try next API
    }
  }

  // Now try to get exact location with browser geolocation
  if (navigator.geolocation) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // User granted permission - use exact location
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            isApproximate: false,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          // User denied or error - use IP location if available, otherwise fallback
          if (ipLocation) {
            resolve(ipLocation);
          } else {
            // Fallback to default location
            resolve({
              lat: 20.5937,
              lng: 78.9629,
              city: 'India',
              country: 'India',
              isApproximate: true,
              isFallback: true
            });
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  }

  // Geolocation not supported - return IP location or fallback
  if (ipLocation) {
    return ipLocation;
  }

  // Fallback to default location if everything fails
  return {
    lat: 20.5937,
    lng: 78.9629,
    city: 'India',
    country: 'India',
    isApproximate: true,
    isFallback: true
  };
}
