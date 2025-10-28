"use client";

import { useEffect, useRef } from 'react';

// Global variable to track if Google Maps API is loaded or loading
let isGoogleMapsLoaded = false;
let isGoogleMapsLoading = false;
let googleMapsCallbacks = [];

// Function to load Google Maps API only once
const loadGoogleMapsAPI = () => {
    return new Promise((resolve, reject) => {
        // If already loaded, resolve immediately
        if (isGoogleMapsLoaded && window.google && window.google.maps) {
            resolve(window.google);
            return;
        }

        // Add callback to queue
        googleMapsCallbacks.push(resolve);

        // If already loading, don't load again
        if (isGoogleMapsLoading) {
            return;
        }

        isGoogleMapsLoading = true;

        // Check if script already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            // Script exists, wait for it to load
            if (window.google && window.google.maps) {
                isGoogleMapsLoaded = true;
                isGoogleMapsLoading = false;
                googleMapsCallbacks.forEach(callback => callback(window.google));
                googleMapsCallbacks = [];
                return;
            }
            // Wait for existing script to load
            existingScript.addEventListener('load', () => {
                isGoogleMapsLoaded = true;
                isGoogleMapsLoading = false;
                googleMapsCallbacks.forEach(callback => callback(window.google));
                googleMapsCallbacks = [];
            });
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            isGoogleMapsLoaded = true;
            isGoogleMapsLoading = false;
            // Resolve all pending callbacks
            googleMapsCallbacks.forEach(callback => callback(window.google));
            googleMapsCallbacks = [];
        };

        script.onerror = () => {
            isGoogleMapsLoading = false;
            googleMapsCallbacks.forEach(callback => callback(null));
            googleMapsCallbacks = [];
            reject(new Error('Failed to load Google Maps API'));
        };

        document.head.appendChild(script);
    });
};

const GoogleMap = ({ 
    center = { lat: 28.6139, lng: 77.2090 }, 
    zoom = 15, 
    markers = [],
    className = "w-full h-full"
}) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        const initMap = async () => {
            try {
                // Wait for Google Maps API to load
                const google = await loadGoogleMapsAPI();
                
                if (!google || !mapRef.current) return;

                // Create map instance
                mapInstanceRef.current = new google.maps.Map(mapRef.current, {
                    center: center,
                    zoom: zoom,
                    mapTypeId: 'roadmap',
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'on' }]
                        }
                    ],
                    mapTypeControl: true,
                    streetViewControl: true,
                    fullscreenControl: true,
                    zoomControl: false, // Remove zoom +/- controls
                });

                // Add markers if provided
                markers.forEach((markerData) => {
                    // Use default Google Maps marker if useDefaultIcon is true
                    const markerOptions = {
                        position: markerData.position,
                        map: mapInstanceRef.current,
                        title: markerData.title
                    };

                    // Only add custom icon if not using default
                    if (!markerData.useDefaultIcon) {
                        markerOptions.icon = {
                            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="16" cy="16" r="14" fill="${markerData.color || '#ef4444'}" stroke="white" stroke-width="3"/>
                                    <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${markerData.icon || '•'}</text>
                                </svg>
                            `),
                            scaledSize: new google.maps.Size(32, 32),
                            anchor: new google.maps.Point(16, 32)
                        };
                    } else {
                        // Use larger default marker
                        markerOptions.icon = {
                            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                            scaledSize: new google.maps.Size(48, 48),
                            anchor: new google.maps.Point(24, 48)
                        };
                    }

                    const marker = new google.maps.Marker(markerOptions);

                    if (markerData.infoContent) {
                        const markerInfoWindow = new google.maps.InfoWindow({
                            content: markerData.infoContent
                        });

                        marker.addListener('click', () => {
                            markerInfoWindow.open(mapInstanceRef.current, marker);
                        });
                    }
                });
            } catch (error) {
                console.error('Error loading Google Maps:', error);
            }
        };

        initMap();

        return () => {
            // Cleanup if needed
            if (mapInstanceRef.current) {
                mapInstanceRef.current = null;
            }
        };
    }, [center, zoom, markers]);

    return <div ref={mapRef} className={className} />;
};

export default GoogleMap;