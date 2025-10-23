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

  // Get current location
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
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
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
      const address = await getAddressFromCoords(locationData.latitude, locationData.longitude);
      
      const visitorData = {
        ...locationData,
        address,
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

      const result = await response.json();
      
      if (result.success) {
        // Mark as visited and update visit count
        localStorage.setItem('hasVisited', 'true');
        localStorage.setItem('visitCount', visitorData.visitCount.toString());
        sessionStorage.setItem('sessionId', visitorData.sessionId);
        
        console.log('Visitor data saved successfully');
        return true;
      } else {
        console.error('Failed to save visitor data:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Error saving visitor data:', error);
      return false;
    }
  };

  // Show location permission alert
  const showLocationAlert = () => {
    const alertMessage = `
      🌍 Location Access Required
      
      We'd like to track your location to:
      • Provide location-based property recommendations
      • Show nearby properties on the map
      • Improve your browsing experience
      
      Your location data will be stored securely and used only for these purposes.
    `;
    
    alert(alertMessage);
  };

  // Main tracking function
  const trackVisitor = async () => {
    if (isTracking) return;
    
    setIsTracking(true);
    
    try {
      // Show alert to user
      showLocationAlert();
      
      // Get device information
      const deviceInfo = getDeviceInfo();
      
      // Get location
      const locationData = await getCurrentLocation();
      
      // Save to database
      const saved = await saveVisitorData(locationData, deviceInfo);
      
      if (saved) {
        console.log('✅ Visitor tracking completed successfully');
      } else {
        console.log('❌ Failed to save visitor data');
      }
      
    } catch (error) {
      console.error('Visitor tracking error:', error);
      
      // Handle different types of errors
      if (error.code === 1) {
        setLocationPermission('denied');
        alert('Location access denied. You can still use the website, but location-based features will be limited.');
      } else if (error.code === 2) {
        alert('Location unavailable. Please check your internet connection and try again.');
      } else if (error.code === 3) {
        alert('Location request timed out. Please try again.');
      } else {
        alert('Unable to get your location. Please ensure location services are enabled.');
      }
    } finally {
      setIsTracking(false);
    }
  };

  // Check if visitor has already been tracked in this session
  const hasTrackedInSession = () => {
    return sessionStorage.getItem('visitorTracked') === 'true';
  };

  // Initialize tracking on component mount
  useEffect(() => {
    // Only track if not already tracked in this session
    if (!hasTrackedInSession()) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        trackVisitor();
        sessionStorage.setItem('visitorTracked', 'true');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default VisitorTracker;
