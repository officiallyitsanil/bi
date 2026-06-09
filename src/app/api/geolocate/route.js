import { NextResponse } from 'next/server';

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

    let geoData = null;

    for (const getApiUrl of ipApis) {
      const url = getApiUrl(ip);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          }
        });
        clearTimeout(timeoutId);

        if (!response.ok) continue;

        const data = await response.json();
        if (data) {
          let lat, lng, city, country;

          if (url.includes('freeipapi.com')) {
            lat = data.latitude;
            lng = data.longitude;
            city = data.cityName;
            country = data.countryName;
          } else if (url.includes('ipwho.is')) {
            lat = data.latitude;
            lng = data.longitude;
            city = data.city;
            country = data.country;
          } else if (url.includes('ipapi.co')) {
            lat = data.latitude;
            lng = data.longitude;
            city = data.city;
            country = data.country_name;
          }

          if (lat && lng) {
            geoData = {
              lat: parseFloat(lat),
              lng: parseFloat(lng),
              city: city || 'Unknown',
              country: country || 'Unknown',
              isApproximate: true,
              ip: ip || data.ip || 'local'
            };
            break; // Found working geolocation, stop loop
          }
        }
      } catch (err) {
        console.warn(`Server side geolocation lookup failed for URL ${url}:`, err.message);
        continue;
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
