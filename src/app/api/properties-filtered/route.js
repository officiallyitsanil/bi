import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import mongoose from 'mongoose';

// Helper function to normalize property data
function normalizeProperty(propertyObj) {
    // Get featured image URL
    let featuredImageUrl = null;
    if (propertyObj.featuredImage?.url) {
        featuredImageUrl = propertyObj.featuredImage.url;
    } else if (propertyObj.interiorImages && propertyObj.interiorImages.length > 0 && propertyObj.interiorImages[0]?.url) {
        featuredImageUrl = propertyObj.interiorImages[0].url;
    } else if (propertyObj.seatLayoutImages && propertyObj.seatLayoutImages.length > 0 && propertyObj.seatLayoutImages[0]?.url) {
        featuredImageUrl = propertyObj.seatLayoutImages[0].url;
    }
    
    return {
        ...propertyObj,
        _id: propertyObj._id.toString(),
        propertyType: propertyObj.Category?.toLowerCase() || propertyObj.propertyType || 'unknown',
        name: propertyObj.propertyName || propertyObj.name || 'Unnamed Property',
        badge: propertyObj.badge || 'new',
        featuredImageUrl: featuredImageUrl,
    };
}

// Helper function to check if price range matches
function matchesPriceRange(priceStr, rangeStr) {
    if (!priceStr || !rangeStr) return true;
    
    // Extract numbers from price string (e.g., "6000-8000" or "6000")
    const priceMatch = priceStr.match(/(\d+)/);
    if (!priceMatch) return true;
    
    const price = parseInt(priceMatch[1]);
    
    // Parse range (e.g., "6000-8000" or "< 5000" or "5000-8000")
    if (rangeStr.includes('-')) {
        const [min, max] = rangeStr.split('-').map(s => parseInt(s.trim()));
        return price >= min && price <= max;
    } else if (rangeStr.startsWith('<')) {
        const max = parseInt(rangeStr.replace(/[<₹,\s]/g, ''));
        return price < max;
    } else if (rangeStr.includes('+')) {
        const min = parseInt(rangeStr.replace(/[+₹,\s]/g, ''));
        return price >= min;
    }
    
    return true;
}

// Helper function to check if seat count matches
function matchesSeatRange(seatsStr, rangeStr) {
    if (!seatsStr || !rangeStr) return true;
    
    // Extract numbers from seats string (e.g., "70 - 90")
    const seatsMatch = seatsStr.match(/(\d+)/);
    if (!seatsMatch) return true;
    
    const seats = parseInt(seatsMatch[1]);
    
    // Parse range (e.g., "70-90" or "< 10" or "10-30")
    if (rangeStr.includes('-')) {
        const [min, max] = rangeStr.split('-').map(s => parseInt(s.trim()));
        return seats >= min && seats <= max;
    } else if (rangeStr.startsWith('<')) {
        const max = parseInt(rangeStr.replace(/[<,\s]/g, ''));
        return seats < max;
    } else if (rangeStr.includes('+')) {
        const min = parseInt(rangeStr.replace(/[+,\s]/g, ''));
        return seats >= min;
    }
    
    return true;
}

export async function GET(request) {
    try {
        await dbConnect();
        
        const url = new URL(request.url);
        const city = url.searchParams.get('city') || '';
        const type = url.searchParams.get('type') || '';
        const preferences = url.searchParams.get('preferences') || '';
        const pricePerDesk = url.searchParams.get('pricePerDesk') || '';
        const pricePerSqft = url.searchParams.get('pricePerSqft') || '';
        const noOfSeats = url.searchParams.get('noOfSeats') || '';
        const category = url.searchParams.get('Category') || ''; // commercial or residential (Category parameter)
        const propertyType = url.searchParams.get('propertyType') || ''; // techpark, standalone, villa, rent, sale, etc. (DB propertyType field)
        const floorsOffered = url.searchParams.get('floorsOffered') || ''; // 1st, 2nd, 3rd, etc.
        const facilities = url.searchParams.get('facilities') || ''; // Parking, 4W Parking, 2W Parking, etc.
        
        const db = mongoose.connection.db;
        let allProperties = [];
        
        // Determine which collection(s) to query based on Category or type
        let queryCommercial = false;
        let queryResidential = false;
        
        if (category === 'commercial' || (type && ['Managed Space', 'Unmanaged Space', 'Coworking Dedicated', 'Coworking Shared', 'Price Per Desk', 'Price Per Sqft', 'No. Of Seats'].includes(type))) {
            queryCommercial = true;
        } else if (category === 'residential' || (type && ['Rent', 'Sale', 'PG/Hostel', 'Flatmates'].includes(type))) {
            queryResidential = true;
        } else {
            // If no clear indication, query both
            queryCommercial = true;
            queryResidential = true;
        }
        
        // Fetch from appropriate collections
        if (queryCommercial) {
            const commercialProperties = await db.collection('commercialProperties').find({}).toArray();
            allProperties = [...allProperties, ...commercialProperties];
        }
        
        if (queryResidential) {
            const residentialProperties = await db.collection('residentialproperties').find({}).toArray();
            allProperties = [...allProperties, ...residentialProperties];
        }
        
        // Apply filters
        let filtered = allProperties.filter(prop => {
            // Filter by Category (Commercial/Residential)
            const propCategory = prop.Category?.toLowerCase() || '';
            if (category) {
                if (category.toLowerCase() === 'commercial' && propCategory !== 'commercial') return false;
                if (category.toLowerCase() === 'residential' && propCategory !== 'residential') return false;
            }
            
            // Filter by propertyType field in DB (techpark, standalone, villa, rent, sale, etc.)
            if (propertyType) {
                const propType = prop.propertyType?.toLowerCase()?.trim() || '';
                const selectedType = prop.selectedType?.toLowerCase()?.trim() || ''; // Only for residential
                const searchPropertyType = propertyType.toLowerCase().trim();
                
                // Handle variations like "pg" vs "pg/hostel" (residential only)
                if (searchPropertyType === 'pg' || searchPropertyType === 'pg/hostel' || searchPropertyType === 'pg-hostel') {
                    // Match if property has "pg" or "hostel" in propertyType or selectedType
                    const hasPg = propType.includes('pg') || propType.includes('hostel') || 
                                  selectedType.includes('pg') || selectedType.includes('hostel');
                    if (!hasPg) {
                        return false;
                    }
                } else {
                    // For commercial properties: only check propertyType field
                    // For residential properties: check both propertyType and selectedType fields
                    let matches = false;
                    
                    if (propCategory === 'commercial') {
                        // Commercial: check propertyType field only
                        matches = propType === searchPropertyType || 
                                 propType.includes(searchPropertyType) || 
                                 searchPropertyType.includes(propType);
                    } else {
                        // Residential: check both propertyType and selectedType fields
                        const matchesPropertyType = propType === searchPropertyType || 
                                                   propType.includes(searchPropertyType) || 
                                                   searchPropertyType.includes(propType);
                        const matchesSelectedType = selectedType === searchPropertyType || 
                                                   selectedType.includes(searchPropertyType) || 
                                                   searchPropertyType.includes(selectedType);
                        matches = matchesPropertyType || matchesSelectedType;
                    }
                    
                    if (!matches) {
                        return false;
                    }
                }
            }
            
            // Filter by city
            if (city) {
                const propCity = prop.address?.city?.toLowerCase() || '';
                const searchCity = city.toLowerCase();
                if (!propCity.includes(searchCity) && !searchCity.includes(propCity)) {
                    return false;
                }
            }
            
            // Filter by floorsOffered (selectedFloors array in DB)
            if (floorsOffered) {
                const propFloors = prop.selectedFloors || [];
                // Check if the property has the selected floor in its selectedFloors array
                // Match case-insensitively (e.g., "5th" matches "5th", "5TH", etc.)
                const searchFloor = floorsOffered.toLowerCase();
                const hasMatchingFloor = propFloors.some(floor => {
                    const floorLower = String(floor).toLowerCase().trim();
                    return floorLower === searchFloor;
                });
                
                if (!hasMatchingFloor) {
                    return false;
                }
            }
            
            // Filter by facilities (facilities array in DB)
            if (facilities) {
                const propFacilities = prop.facilities || [];
                const searchFacility = facilities.toLowerCase().trim();
                
                // Check if the property has the selected facility in its facilities array
                // Match case-insensitively (e.g., "4W Parking" matches "4W PARKING", "2W Parking" matches "2W PARKING", etc.)
                // Handle both commercial (objects with .name) and residential (strings) formats
                const hasMatchingFacility = propFacilities.some(facility => {
                    // Handle both string and object formats
                    let facilityName = '';
                    if (typeof facility === 'string') {
                        facilityName = facility;
                    } else if (facility && typeof facility === 'object') {
                        // Commercial properties: facility.name
                        facilityName = facility.name || facility.Name || '';
                    }
                    
                    if (!facilityName) return false;
                    
                    const facilityLower = facilityName.toLowerCase().trim();
                    
                    // Exact match (case-insensitive): "4W Parking" === "4W PARKING"
                    if (facilityLower === searchFacility) {
                        return true;
                    }
                    
                    // For "Parking" (without 4W/2W), also match "4W Parking" and "2W Parking"
                    if (searchFacility === 'parking' && facilityLower.includes('parking')) {
                        return true;
                    }
                    
                    // For other facilities - check if names match (handles variations)
                    if (facilityLower.includes(searchFacility) || searchFacility.includes(facilityLower)) {
                        return true;
                    }
                    
                    return false;
                });
                
                if (!hasMatchingFacility) {
                    return false;
                }
            }
            
            // Filter by type based on property category
            // Skip this filter if propertyType filter is already applied (propertyType takes precedence)
            if (type && !propertyType) {
                if (propCategory === 'residential') {
                    // For residential: match selectedType field
                    const selectedType = prop.selectedType?.toLowerCase() || '';
                    const searchType = type.toLowerCase();
                    
                    // Map search types to DB values
                    const typeMap = {
                        'rent': 'rent',
                        'sale': 'sale',
                        'pg/hostel': 'pg',
                        'flatmates': 'flatmates'
                    };
                    
                    const mappedType = typeMap[searchType] || searchType;
                    if (selectedType !== mappedType && !selectedType.includes(mappedType)) {
                        return false;
                    }
                } else if (propCategory === 'commercial') {
                    // For commercial: match category field (lowercase) - STRICT MATCHING
                    const propCategoryLower = prop.category?.toLowerCase()?.trim() || '';
                    const searchType = type.toLowerCase().trim();
                    
                    // Map search types to DB category values
                    // Note: category in DB is lowercase like "coworking shared" or "managed space"
                    const categoryMap = {
                        'managed space': 'managed space',
                        'unmanaged space': 'unmanaged space',
                        'coworking dedicated': 'coworking dedicated',
                        'coworking shared': 'coworking shared',
                        'price per desk': 'price per desk',
                        'price per sqft': 'price per sqft',
                        'no. of seats': 'no of seats',
                        'no of seats': 'no of seats'
                    };
                    
                    const mappedCategory = categoryMap[searchType] || searchType;
                    
                    // STRICT EXACT MATCH - property category must exactly match the search type
                    // If property has no category or doesn't match, exclude it
                    if (!propCategoryLower || propCategoryLower !== mappedCategory) {
                        return false;
                    }
                }
            }
            
            // Filter by preferences for commercial properties
            // Only apply if type is "Price Per Desk", "Price Per Sqft", or "No. Of Seats"
            if (propCategory === 'commercial' && type && 
                (type.toLowerCase().includes('price per desk') || 
                 type.toLowerCase().includes('price per sqft') || 
                 type.toLowerCase().includes('no. of seats') || 
                 type.toLowerCase().includes('no of seats'))) {
                
                if (!prop.floorConfigurations || prop.floorConfigurations.length === 0) {
                    return false;
                }
                
                let matchesPreferences = false;
                
                // Check each floor configuration - at least one must match
                for (const floorConfig of prop.floorConfigurations) {
                    if (floorConfig.dedicatedCabin) {
                        const cabin = floorConfig.dedicatedCabin;
                        let floorMatches = true;
                        
                        // Check price per desk (pricePerSeat in DB)
                        if (type.toLowerCase().includes('price per desk') && pricePerDesk && pricePerDesk !== 'Any') {
                            if (cabin.pricePerSeat) {
                                floorMatches = floorMatches && matchesPriceRange(cabin.pricePerSeat, pricePerDesk);
                            } else {
                                floorMatches = false;
                            }
                        }
                        
                        // Check price per sqft
                        if (type.toLowerCase().includes('price per sqft') && pricePerSqft && pricePerSqft !== 'Any' && pricePerSqft !== 'N/A') {
                            if (cabin.pricePerSqft) {
                                floorMatches = floorMatches && matchesPriceRange(cabin.pricePerSqft, pricePerSqft);
                            } else {
                                floorMatches = false;
                            }
                        }
                        
                        // Check number of seats
                        if ((type.toLowerCase().includes('no. of seats') || type.toLowerCase().includes('no of seats')) && noOfSeats && noOfSeats !== 'Any') {
                            if (cabin.seats) {
                                floorMatches = floorMatches && matchesSeatRange(cabin.seats, noOfSeats);
                            } else {
                                floorMatches = false;
                            }
                        }
                        
                        if (floorMatches) {
                            matchesPreferences = true;
                            break; // At least one floor matches
                        }
                    }
                }
                
                if (!matchesPreferences) {
                    return false;
                }
            }
            
            // Also check preferences parameter if provided (for other filter types like Managed/Unmanaged Space)
            if (preferences && preferences !== 'Any' && preferences !== 'see-all') {
                // For commercial properties with Managed/Unmanaged Space, match preferences against facilities
                if (propCategory === 'commercial' && type && 
                    (type.toLowerCase().includes('managed space') || type.toLowerCase().includes('unmanaged space'))) {
                    
                    // Map preference values to facility names
                    const preferenceMap = {
                        'near-metro': 'Metro',
                        'parking': 'Parking',
                        'cafeteria': 'Cafeteria',
                        'gym': 'Gym'
                    };
                    
                    const facilityToCheck = preferenceMap[preferences.toLowerCase()] || preferences;
                    const propFacilities = prop.facilities || [];
                    
                    // Check if property has the requested facility
                    const hasFacility = propFacilities.some(facility => {
                        const facilityName = typeof facility === 'string' ? facility : facility.name || '';
                        return facilityName.toLowerCase().includes(facilityToCheck.toLowerCase()) || 
                               facilityToCheck.toLowerCase().includes(facilityName.toLowerCase());
                    });
                    
                    if (!hasFacility) {
                        return false;
                    }
                }
            }
            
            return true;
        });
        
        // Normalize properties
        const normalized = filtered.map(prop => normalizeProperty(prop));
        
        return NextResponse.json({
            success: true,
            count: normalized.length,
            data: normalized
        });
    } catch (error) {
        console.error('❌ Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

