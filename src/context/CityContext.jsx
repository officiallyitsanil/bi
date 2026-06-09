"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const CityContext = createContext({
    activeCityFilter: null,
    setActiveCityFilter: () => {},
    citySearchQuery: '',
    setCitySearchQuery: () => {},
});

export function CityProvider({ children }) {
    const [activeCityFilter, setActiveCityFilterState] = useState(null);
    const [citySearchQuery, setCitySearchQuery] = useState('');

    // Clear manual city selection from localStorage synchronously on mount/render if not on a details page.
    // This prevents race conditions with child components' autoDetectCity GPS updates.
    if (typeof window !== 'undefined') {
        try {
            const isDetailsPage = window.location.pathname.includes('/property-details');
            if (!isDetailsPage) {
                localStorage.removeItem('selectedCity');
                localStorage.removeItem('isManualCitySelection');
            }
        } catch (e) {
            console.error('Error clearing localStorage in CityProvider:', e);
        }
    }

    const setActiveCityFilter = (city) => {
        setActiveCityFilterState(city);
        try {
            if (city) {
                localStorage.setItem('selectedCity', city);
            } else {
                localStorage.removeItem('selectedCity');
            }
        } catch (e) {
            console.error('Error saving selectedCity to localStorage:', e);
        }
    };

    // Load initial city from localStorage on client-side mount if manually selected and on details page
    useEffect(() => {
        try {
            const isDetailsPage = window.location.pathname.includes('/property-details');
            const savedCity = localStorage.getItem('selectedCity');
            const isManual = localStorage.getItem('isManualCitySelection') === 'true';
            if (savedCity && isManual && isDetailsPage) {
                setActiveCityFilterState(savedCity);
                setCitySearchQuery(savedCity);
            }
        } catch (e) {
            console.error('Error loading selectedCity from localStorage:', e);
        }
    }, []);

    const value = {
        activeCityFilter,
        setActiveCityFilter,
        citySearchQuery,
        setCitySearchQuery,
    };

    return (
        <CityContext.Provider value={value}>
            {children}
        </CityContext.Provider>
    );
}

export function useCity() {
    const context = useContext(CityContext);
    if (context === undefined) {
        throw new Error('useCity must be used within a CityProvider');
    }
    return context;
}

export default CityContext;
