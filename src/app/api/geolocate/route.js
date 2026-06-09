import { NextResponse } from 'next/server';

async function fetchGeoFromApi(getApiUrl, ip) {
  const url = getApiUrl(ip);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout per API

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data) {
      throw new Error("No data returned");
    }

    let lat, lng, city, country;

    if (url.includes('freeipapi.com')) {
      lat = data.latitude;
      lng = data.longitude;
      city = data.cityName;
      country = data.countryName;
    } else if (url.includes('ipwho.is')) {
      if (data.success === false) {
        throw new Error(data.message || "ipwho.is failed");
      }
      lat = data.latitude;
      lng = data.longitude;
      city = data.city;
      country = data.country;
    } else if (url.includes('ipapi.co')) {
      if (data.error) {
        throw new Error(data.reason || "ipapi.co failed");
      }
      lat = data.latitude;
      lng = data.longitude;
      city = data.city;
      country = data.country_name;
    }

    if (lat && lng) {
      return {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        city: city || 'Unknown',
        country: country || 'Unknown',
        isApproximate: true,
        ip: ip || data.ip || 'local'
      };
    } else {
      throw new Error("Invalid lat/lng in response");
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`Server side geolocation lookup failed for URL ${url}:`, err.message);
    throw err;
  }
}

export async function GET(request) {
  try {
    // 1. Get client IP address from headers
    let ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             '';

    // Handle multiple IPs in x-forwarded-for (comma separated)
    if (ip && ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }

    // Clean IP
    ip = ip.trim();

    // Check if IP is local/loopback
    const isLocal = !ip || 
                    ip === '127.0.0.1' || 
                    ip === '::1' || 
                    ip.startsWith('192.168.') || 
                    ip.startsWith('10.') || 
                    ip.startsWith('172.16.');

    const ipApis = [
      (clientIp) => isLocal ? 'https://freeipapi.com/api/json' : `https://freeipapi.com/api/json/${clientIp}`,
      (clientIp) => isLocal ? 'https://ipwho.is/' : `https://ipwho.is/${clientIp}`,
      (clientIp) => isLocal ? 'https://ipapi.co/json/' : `https://ipapi.co/${clientIp}/json/`
    ];

    // Try APIs sequentially for consistent results (avoid Promise.any race returning different cities)
    let geoData = null;
    for (const getApiUrl of ipApis) {
      try {
        geoData = await fetchGeoFromApi(getApiUrl, ip);
        if (geoData) break;
      } catch (err) {
        // try next provider
      }
    }

    if (geoData) {
      return NextResponse.json({
        success: true,
        data: geoData
      });
    }

    // Fallback if all lookups failed
    return NextResponse.json({
      success: false,
      error: 'All geolocation lookups failed'
    });

  } catch (error) {
    console.error('Error in geolocate API:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
