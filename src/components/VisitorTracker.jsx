"use client";
import { useEffect, useState } from 'react';

const VisitorTracker = () => {
  const [locationPermission, setLocationPermission] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  // Get device information
  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Detect browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';
    
    // Detect device type
    let deviceType = 'desktop';
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/iPad|Android(?=.*Tablet)|Kindle|Silk/i.test(userAgent)) {
      deviceType = 'tablet';
    }
    
    // Get screen resolution
    const screenResolution = {
      width: window.screen.width,
      height: window.screen.height
    };
    
    // Get connection type if available
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const connectionType = connection ? connection.effectiveType : 'unknown';
    
    return {
      userAgent,
      platform,
      browser,
      deviceType,
      screenResolution,
      language,
      timezone,
      connectionType
    };
  };

  // Get current location with high accuracy
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          const geoError = new Error(`Geolocation error: ${error.message}`);
          geoError.code = error.code;
          geoError.originalError = error;
          reject(geoError);
        },
        {
          enableHighAccuracy: true, // Enable high accuracy for exact location
          timeout: 10000, // 10 seconds timeout
          maximumAge: 0 // Don't use cached position
        }
      );
    });
  };

  // Reverse geocoding to get address
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return null;
    } catch (error) {
      console.error('Error getting address:', error);
      return null;
    }
  };

  // Save visitor data to database
  const saveVisitorData = async (locationData, deviceInfo) => {
    try {
      let address = null;
      
      // Get address if we have location data
      if (locationData && locationData.latitude && locationData.longitude) {
        address = await getAddressFromCoords(locationData.latitude, locationData.longitude);
      }
      
      const visitorData = {
        ...(locationData || {}), // Spread location data only if it exists
        address, // Include address in the data
        ...deviceInfo,
        sessionId: sessionStorage.getItem('sessionId') || Date.now().toString(),
        referrer: document.referrer,
        pageUrl: window.location.href,
        isFirstVisit: !localStorage.getItem('hasVisited'),
        visitCount: parseInt(localStorage.getItem('visitCount') || '0') + 1
      };

      const response = await fetch('/api/visitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitorData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Mark as visited and update visit count
        localStorage.setItem('hasVisited', 'true');
        localStorage.setItem('visitCount', visitorData.visitCount.toString());
        sessionStorage.setItem('sessionId', visitorData.sessionId);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  // Main tracking function
  const trackVisitor = async () => {
    if (isTracking) return;
    
    setIsTracking(true);
    console.log('📍 Tracking visitor - getting device info...');
    
    // Get device information
    const deviceInfo = getDeviceInfo();
    let locationData = null;
    
    // FORCE location request - browser WILL show permission popup
    try {
      console.log('🔍 Requesting location permission from browser...');
      locationData = await getCurrentLocation();
      console.log('✅ Location obtained successfully:', locationData);
      setLocationPermission('granted');
    } catch (error) {
      console.error('❌ Location access FAILED:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      // Silently handle location errors - no alerts
      if (error.code === 1) {
        console.log('User DENIED location permission');
        setLocationPermission('denied');
      } else if (error.code === 2) {
        console.log('Location UNAVAILABLE');
      } else if (error.code === 3) {
        console.log('Location request TIMEOUT');
      }
      // Continue without location data
    }
    
    // Save to database (with or without location)
    try {
      console.log('💾 Saving visitor data to database...', locationData ? 'WITH location' : 'WITHOUT location');
      const saved = await saveVisitorData(locationData, deviceInfo);
      if (saved) {
        console.log('✅✅✅ Visitor data SAVED to database successfully!');
      } else {
        console.log('❌❌❌ FAILED to save visitor data to database');
      }
    } catch (error) {
      console.error('💥 Error during visitor tracking:', error);
    } finally {
      setIsTracking(false);
    }
  };

  // Initialize tracking on component mount
  useEffect(() => {
    console.log('🚀 Starting visitor tracking - requesting location...');
    // Request location immediately on every page load
    setTimeout(() => {
      trackVisitor();
    }, 500);
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default VisitorTracker;
