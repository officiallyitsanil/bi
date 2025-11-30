/**
 * Get user's location using browser geolocation API (with permission)
 * or fallback to IP-based geolocation
 */
export async function getUserLocation() {
  // First, try to get IP-based location (no permission needed)
  try {
    const ipResponse = await fetch('https://ipapi.co/json/');
    const ipData = await ipResponse.json();
    
    if (ipData.latitude && ipData.longitude) {
      const ipLocation = {
        lat: ipData.latitude,
        lng: ipData.longitude,
        city: ipData.city,
        country: ipData.country_name,
        isApproximate: true
      };

      // Now try to get exact location with permission
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
              // User denied or error - use IP location
              resolve(ipLocation);
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            }
          );
        });
      }

      // Geolocation not supported - return IP location
      return ipLocation;
    }
  } catch (error) {
    console.error('Error getting IP location:', error);
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
