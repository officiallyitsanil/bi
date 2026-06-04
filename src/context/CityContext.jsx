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

    // Load initial city from localStorage on client-side mount
    useEffect(() => {
        try {
            const savedCity = localStorage.getItem('selectedCity');
            if (savedCity) {
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
