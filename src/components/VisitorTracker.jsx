"use client";
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

const VisitorTracker = ({ onLocationUpdate }) => {
  const [trackingStatus, setTrackingStatus] = useState('idle');
  const hasTracked = useRef(false);
  const pathname = usePathname();

  // Check if this is the homepage
  const isHomepage = pathname === '/';

  // Get device information
  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';

    let deviceType = 'desktop';
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/iPad|Android(?=.*Tablet)|Kindle|Silk/i.test(userAgent)) {
      deviceType = 'tablet';
    }

    const screenResolution = {
      width: window.screen.width,
      height: window.screen.height
    };

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

  // Get detailed location information from coordinates
  const getDetailedLocation = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const addressComponents = result.address_components;

        // Extract detailed location components with priority order
        const locationDetails = {
          location: result.formatted_address,
          locality: '',
          sublocality: '',
          district: '',
          state: '',
          country: '',
          postal: ''
        };

        // First pass: collect all available data
        const tempData = {
          locality: [],
          sublocality: [],
          sublocality_level_1: [],
          administrative_area_level_2: [],
          administrative_area_level_3: []
        };

        addressComponents.forEach(component => {
          const types = component.types;

          if (types.includes('locality')) {
            tempData.locality.push(component.long_name);
          }
          if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
            tempData.sublocality.push(component.long_name);
          }
          if (types.includes('administrative_area_level_3')) {
            tempData.administrative_area_level_3.push(component.long_name);
          }
          if (types.includes('administrative_area_level_2')) {
            tempData.administrative_area_level_2.push(component.long_name);
          }
          if (types.includes('administrative_area_level_1')) {
            locationDetails.state = component.long_name;
          }
          if (types.includes('country')) {
            locationDetails.country = component.long_name;
          }
          if (types.includes('postal_code')) {
            locationDetails.postal = component.long_name;
          }
        });

        // Priority order for locality (city/town):
        // 1. locality (most accurate city name)
        // 2. sublocality (neighborhood/area within city)
        // 3. administrative_area_level_3 (tehsil/taluka)
        locationDetails.locality = tempData.locality[0] ||
          tempData.sublocality[0] ||
          tempData.administrative_area_level_3[0] ||
          '';

        // Sublocality for more specific area
        locationDetails.sublocality = tempData.sublocality[0] || '';

        // District is administrative_area_level_2
        locationDetails.district = tempData.administrative_area_level_2[0] || '';

        return locationDetails;
      }
      return null;
    } catch (error) {
      console.error('Error getting detailed location:', error);
      return null;
    }
  };

  // Get IP-based location (no permission needed)
  const getIPLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      if (data.latitude && data.longitude) {
        // Get detailed location from Google Maps API
        const detailedLocation = await getDetailedLocation(data.latitude, data.longitude);

        const ipLocation = {
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city,
          region: data.region,
          country: data.country_name,
          postal: data.postal,
          timezone: data.timezone,
          org: data.org,
          ...(detailedLocation || {})
        };
        return ipLocation;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting IP location:', error);
      return null;
    }
  };

  // Get GPS location (requires permission)
  const getGPSLocation = (retries = 1) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 30000, // Increased to 30 seconds
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const gpsLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          };
          resolve(gpsLocation);
        },
        (error) => {
          // Retry on timeout (code 3) or position unavailable (code 2) if retries left
          if (retries > 0 && (error.code === 3 || error.code === 2)) {
            // Add a small delay before retrying
            setTimeout(() => {
              getGPSLocation(retries - 1).then(resolve).catch(reject);
            }, 1000);
          } else {
            reject(error);
          }
        },
        options
      );
    });
  };

  // Save visitor data to database
  const saveVisitorData = async (ipLocation, gpsLocation, deviceInfo, locationPermission, isUpdate = false, existingVisitorId = null) => {
    try {
      const sessionId = sessionStorage.getItem('sessionId') || Date.now().toString();
      const hasVisited = localStorage.getItem('hasVisitedHomepage');
      const visitCount = parseInt(localStorage.getItem('visitCount') || '0') + 1;

      // Get detailed location for GPS coordinates if available
      let gpsLocationWithDetails = null;
      if (gpsLocation && gpsLocation.latitude && gpsLocation.longitude) {
        const detailedLocation = await getDetailedLocation(gpsLocation.latitude, gpsLocation.longitude);
        gpsLocationWithDetails = {
          ...gpsLocation,
          ...(detailedLocation || {})
        };
      }

      const visitorData = {
        visitorId: existingVisitorId, // Pass the ID if we have it
        ipLocation,
        gpsLocation: gpsLocationWithDetails,
        ...deviceInfo,
        sessionId,
        referrer: document.referrer,
        pageUrl: window.location.href,
        isFirstVisit: !hasVisited,
        visitCount,
        locationPermission,
        isHomepageVisit: isHomepage
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
        localStorage.setItem('hasVisitedHomepage', 'true');
        localStorage.setItem('visitCount', visitCount.toString());
        sessionStorage.setItem('sessionId', sessionId);
        return result.visitorId; // Return the ID for future updates
      }
      return null;
    } catch (error) {
      console.error('❌ Error saving visitor data:', error);
      return null;
    }
  };
  // Main tracking function
  const trackVisitor = async () => {
    if (trackingStatus !== 'idle') return;

    setTrackingStatus('tracking');

    const deviceInfo = getDeviceInfo();
    let ipLocation = null;
    let gpsLocation = null;
    let locationPermission = 'not_requested';

    // Step 1: Get IP-based location first (no permission needed)
    ipLocation = await getIPLocation();

    // Notify parent component about IP location for map zoom
    if (ipLocation && onLocationUpdate) {
      onLocationUpdate({
        lat: ipLocation.latitude,
        lng: ipLocation.longitude,
        zoom: 10, // City-level zoom for IP location
        source: 'ip'
      });
    }

    // Step 2: Save initial data with IP location (creates new visitor record)
    const initialVisitorId = await saveVisitorData(ipLocation, null, deviceInfo, 'not_requested', false);

    // Step 3: Request GPS location permission
    try {
      gpsLocation = await getGPSLocation();
      locationPermission = 'granted';

      // Notify parent component about GPS location for map zoom
      if (gpsLocation && onLocationUpdate) {
        onLocationUpdate({
          lat: gpsLocation.latitude,
          lng: gpsLocation.longitude,
          zoom: 11, // Reduced zoom level as requested (was 12)
          source: 'gps'
        });
      }

      // Step 4: Update SAME visitor record with GPS location
      await saveVisitorData(ipLocation, gpsLocation, deviceInfo, locationPermission, true, initialVisitorId);

    } catch (error) {
      // User denied or error occurred
      if (error.code === 1) {
        locationPermission = 'denied';
      }
      // Update record with final status even if GPS failed
      await saveVisitorData(ipLocation, null, deviceInfo, locationPermission, true, initialVisitorId);
    }

    setTrackingStatus('completed');
  };

  useEffect(() => {
    // Only track on homepage and only once per session
    if (!isHomepage || hasTracked.current) {
      return;
    }

    // Check if user has already visited homepage in this browser
    const hasVisitedHomepage = localStorage.getItem('hasVisitedHomepage');

    // Only track first-time visitors OR if you want to track every visit, remove this check
    if (hasVisitedHomepage) {
      return;
    }

    hasTracked.current = true;

    // Start tracking after a short delay
    const timer = setTimeout(() => {
      trackVisitor();
    }, 1000);

    return () => clearTimeout(timer);
  }, [isHomepage]);

  return null;
};

export default VisitorTracker;
