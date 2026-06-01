"use client";

import { createContext, useContext, useState } from 'react';

const CityContext = createContext({
    activeCityFilter: null,
    setActiveCityFilter: () => {},
    citySearchQuery: '',
    setCitySearchQuery: () => {},
});

export function CityProvider({ children }) {
    const [activeCityFilter, setActiveCityFilter] = useState(null);
    const [citySearchQuery, setCitySearchQuery] = useState('');

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
