// Mapping of amenity names to their corresponding icon files
// Icons are located in /public/property-details/amenties/

const amenityIconMap = {
    // Beverages & Food
    "tea": "/property-details/amenties/tea.png",
    "coffee": "/property-details/amenties/coffee.png",
    "milk": "/property-details/amenties/milk.png",
    "water": "/property-details/amenties/water.png",
    "food vendor": "/property-details/amenties/food-vendor.png",
    
    // Pantry & Kitchen
    "pantry available 24/7": "/property-details/amenties/cups-mugs.png",
    "pantry": "/property-details/amenties/cups-mugs.png",
    "cups/mugs": "/property-details/amenties/cups-mugs.png",
    
    // Cleaning & Maintenance
    "daily upkeep of bathrooms...": "/property-details/amenties/daily-upkeep.png",
    "daily upkeep of bathrooms": "/property-details/amenties/daily-upkeep.png",
    "daily upkeep": "/property-details/amenties/daily-upkeep.png",
    "deep cleaning": "/property-details/amenties/deep-cleaning.png",
    "general cleaning": "/property-details/amenties/general-cleaning.png",
    "nightly trash": "/property-details/amenties/nighty-trash.png",
    "nightly trash removal": "/property-details/amenties/nighty-trash.png",
    "pest extermination": "/property-details/amenties/pest-extermination.png",
    
    // Internet & Tech
    "high - speed wi-fi 24/7": "/property-details/amenties/wifi.png",
    "high-speed wi-fi 24/7": "/property-details/amenties/wifi.png",
    "high speed wi-fi": "/property-details/amenties/wifi.png",
    "wi-fi": "/property-details/amenties/wifi.png",
    "wifi": "/property-details/amenties/wifi.png",
    "high - speed wi-fi": "/property-details/amenties/wifi.png",
    
    // Meeting & Conference
    "conference room access": "/property-details/amenties/club.png",
    "conference room": "/property-details/amenties/club.png",
    "meeting/conf... room": "/property-details/amenties/club.png",
    "meeting room": "/property-details/amenties/club.png",
    "meeting/conference room": "/property-details/amenties/club.png",
    
    // Parking
    "2 wheeler parking": "/property-details/amenties/2wparking.png",
    "2w parking": "/property-details/amenties/2wparking.png",
    "4 wheeler parking": "/property-details/amenties/4wparking.png",
    "4w parking": "/property-details/amenties/4wparking.png",
    "visitor parking": "/property-details/amenties/visitor-parking.png",
    "ev charging space": "/property-details/amenties/ev-charging-space.png",
    "ev charging": "/property-details/amenties/ev-charging-space.png",
    
    // Security & Safety
    "building security": "/property-details/amenties/building-security.png",
    "security guard": "/property-details/amenties/security-guard.png",
    "fire alarm": "/property-details/amenties/fire-alarm.png",
    "fire extinguisher": "/property-details/amenties/fire-extinguisher.png",
    "fire noc": "/property-details/amenties/fire-noc.png",
    "smoke detector": "/property-details/amenties/smoke-detector.png",
    "first aid kit": "/property-details/amenties/first-aidkit.png",
    "first-aid kit": "/property-details/amenties/first-aidkit.png",
    
    // Building Features
    "elevator": "/property-details/amenties/elevator.png",
    "lift": "/property-details/amenties/elevator.png",
    "accessible": "/property-details/amenties/accessable.png",
    "wheelchair accessible": "/property-details/amenties/accessable.png",
    
    // Utilities
    "electricity": "/property-details/amenties/electricity.png",
    "power supply": "/property-details/amenties/power-supply.png",
    "dg backup": "/property-details/amenties/dg-backup.png",
    "generator backup": "/property-details/amenties/dg-backup.png",
    "water supply": "/property-details/amenties/water-supply.png",
    "sewage system": "/property-details/amenties/sewage-system.png",
    "hvac": "/property-details/amenties/hvac.png",
    "air conditioning": "/property-details/amenties/hvac.png",
    "gas": "/property-details/amenties/gas.png",
    
    // Office Supplies
    "printers": "/property-details/amenties/printers.png",
    "printer": "/property-details/amenties/printers.png",
    "paper shredding": "/property-details/amenties/paper-shreding.png",
    "envelopes": "/property-details/amenties/enevelopes.png",
    "sticky notes": "/property-details/amenties/sticky-notes.png",
    "tape/paper": "/property-details/amenties/tape-paper.png",
    
    // Reception & Guest Services
    "guest check-in": "/property-details/amenties/guest-checkin.png",
    "guest checkin": "/property-details/amenties/guest-checkin.png",
    "guest management": "/property-details/amenties/guest-management.png",
    "delivery acceptance": "/property-details/amenties/delivery-acceptance.png",
    "package notification": "/property-details/amenties/package-notification.png",
    
    // Workspace
    "open desk": "/property-details/amenties/open-desk.png",
    "open desks": "/property-details/amenties/open-desk.png",
    
    // Certifications & Permits
    "oc": "/property-details/amenties/oc.png",
    "occupancy certificate": "/property-details/amenties/oc.png",
    "permit": "/property-details/amenties/permit.png",
    "sez": "/property-details/amenties/sez.png",
    "property insurance": "/property-details/amenties/property-insurance.png",
    
    // Recreation
    "club": "/property-details/amenties/club.png",
    "playground": "/property-details/amenties/playground.png",
};

// All available amenity icons from the public folder
const AVAILABLE_ICONS = [
    "/property-details/amenties/2wparking.png",
    "/property-details/amenties/4wparking.png",
    "/property-details/amenties/accessable.png",
    "/property-details/amenties/building-security.png",
    "/property-details/amenties/club.png",
    "/property-details/amenties/coffee.png",
    "/property-details/amenties/cups-mugs.png",
    "/property-details/amenties/daily-upkeep.png",
    "/property-details/amenties/deep-cleaning.png",
    "/property-details/amenties/delivery-acceptance.png",
    "/property-details/amenties/dg-backup.png",
    "/property-details/amenties/electricity.png",
    "/property-details/amenties/elevator.png",
    "/property-details/amenties/enevelopes.png",
    "/property-details/amenties/ev-charging-space.png",
    "/property-details/amenties/fire-alarm.png",
    "/property-details/amenties/fire-extinguisher.png",
    "/property-details/amenties/fire-noc.png",
    "/property-details/amenties/first-aidkit.png",
    "/property-details/amenties/food-vendor.png",
    "/property-details/amenties/gas.png",
    "/property-details/amenties/general-cleaning.png",
    "/property-details/amenties/guest-checkin.png",
    "/property-details/amenties/guest-management.png",
    "/property-details/amenties/hvac.png",
    "/property-details/amenties/milk.png",
    "/property-details/amenties/nighty-trash.png",
    "/property-details/amenties/oc.png",
    "/property-details/amenties/open-desk.png",
    "/property-details/amenties/package-notification.png",
    "/property-details/amenties/paper-shreding.png",
    "/property-details/amenties/permit.png",
    "/property-details/amenties/pest-extermination.png",
    "/property-details/amenties/playground.png",
    "/property-details/amenties/power-supply.png",
    "/property-details/amenties/printers.png",
    "/property-details/amenties/property-insurance.png",
    "/property-details/amenties/security-guard.png",
    "/property-details/amenties/sewage-system.png",
    "/property-details/amenties/sez.png",
    "/property-details/amenties/smoke-detector.png",
    "/property-details/amenties/sticky-notes.png",
    "/property-details/amenties/tape-paper.png",
    "/property-details/amenties/tea.png",
    "/property-details/amenties/visitor-parking.png",
    "/property-details/amenties/water-supply.png",
    "/property-details/amenties/water.png",
    "/property-details/amenties/wifi.png"
];

// Default icon for unmapped amenities
const DEFAULT_ICON = "/property-details/amenties/accessable.png";

/**
 * Gets a random icon from available icons based on amenity name (deterministic)
 * This ensures the same amenity name always gets the same icon
 * @param {string} amenityName - The amenity name to use for selection
 * @returns {string} - Random icon path
 */
function getRandomIcon(amenityName) {
    if (!amenityName || typeof amenityName !== 'string') {
        return DEFAULT_ICON;
    }
    
    // Use the amenity name as a seed for deterministic random selection
    let hash = 0;
    for (let i = 0; i < amenityName.length; i++) {
        const char = amenityName.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Get a positive index
    const index = Math.abs(hash) % AVAILABLE_ICONS.length;
    return AVAILABLE_ICONS[index];
}

/**
 * Validates if an icon path is from the available icons list
 * @param {string} iconPath - The icon path to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidIcon(iconPath) {
    if (!iconPath || typeof iconPath !== 'string') {
        return false;
    }
    // Check if it's in the available icons list
    return AVAILABLE_ICONS.includes(iconPath) || iconPath.startsWith('/property-details/amenties/');
}

/**
 * Maps an amenity string to an object with name and image
 * @param {string} amenityName - The amenity name string
 * @returns {Object} - Object with name and image properties
 */
export function mapAmenityToObject(amenityName) {
    if (!amenityName || typeof amenityName !== 'string') {
        return null;
    }
    
    const normalizedName = amenityName.toLowerCase().trim();
    let iconPath = amenityIconMap[normalizedName];
    
    // If no match found, get a random icon
    if (!iconPath) {
        iconPath = getRandomIcon(amenityName);
    }
    
    // Validate the icon path, if invalid, get a random one
    if (!isValidIcon(iconPath)) {
        iconPath = getRandomIcon(amenityName);
    }
    
    return {
        name: amenityName,
        image: iconPath
    };
}

/**
 * Maps an array of amenity strings to an array of amenity objects
 * @param {Array} amenities - Array of amenity strings or objects
 * @returns {Array} - Array of amenity objects with name and image properties
 */
export function mapAmenitiesToObjects(amenities) {
    if (!Array.isArray(amenities)) {
        return [];
    }
    
    return amenities
        .map(amenity => {
            // If already an object with name and image, validate the image
            if (amenity && typeof amenity === 'object' && amenity.name) {
                // If image is missing or invalid, get a random one
                if (!amenity.image || !isValidIcon(amenity.image)) {
                    return {
                        name: amenity.name,
                        image: getRandomIcon(amenity.name)
                    };
                }
                return amenity;
            }
            // If it's a string, map it to an object
            if (typeof amenity === 'string') {
                return mapAmenityToObject(amenity);
            }
            return null;
        })
        .filter(Boolean); // Remove null values
}

export default amenityIconMap;

