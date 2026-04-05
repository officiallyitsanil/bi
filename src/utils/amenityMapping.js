// Mapping of amenity names to their corresponding icon files
// Icons are located in /public/amenities/

const amenityIconMap = {
    // Beverages & Food
    "tea": "/amenities/Tea.png",
    "coffee": "/amenities/coffee.png",
    "milk": "/amenities/milk.png",
    "water": "/amenities/water.png",
    "food vendor": "/amenities/Food%20Vendor.png",
    
    // Pantry & Kitchen
    "pantry available 24/7": "/amenities/Pantry.png",
    "pantry": "/amenities/Pantry.png",
    "cups/mugs": "/amenities/Pantry.png",
    "cups & mugs": "/amenities/Pantry.png",
    
    // Cleaning & Maintenance
    "daily upkeep of bathrooms...": "/amenities/Daily%20Upkeep.png",
    "daily upkeep of bathrooms": "/amenities/Daily%20Upkeep.png",
    "daily upkeep": "/amenities/Daily%20Upkeep.png",
    "deep cleaning": "/property-details/amenties/deep-cleaning.png",
    "general cleaning": "/property-details/amenties/general-cleaning.png",
    "nightly trash": "/amenities/Nightly%20Thrash.png",
    "nightly trash removal": "/amenities/Nightly%20Thrash.png",
    "pest extermination": "/property-details/amenties/pest-extermination.png",
    
    // Internet & Tech
    "high - speed wi-fi 24/7": "/amenities/wifi.png",
    "high-speed wi-fi 24/7": "/amenities/wifi.png",
    "high speed wi-fi": "/amenities/wifi.png",
    "wi-fi": "/amenities/wifi.png",
    "wifi": "/amenities/wifi.png",
    "high - speed wi-fi": "/amenities/wifi.png",
    
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
    "building security": "/amenities/security.png",
    "gated community": "/amenities/security.png",
    "security guard": "/amenities/security.png",
    "fire alarm": "/amenities/Fire%20%26%20seafty.png",
    "fire extinguisher": "/amenities/Fire%20%26%20seafty.png",
    "fire safety": "/amenities/Fire%20%26%20seafty.png",
    "fire noc": "/amenities/Fire%20%26%20seafty.png",
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
    "guest check-in": "/amenities/Guest%20Check%20in.png",
    "guest checkin": "/amenities/Guest%20Check%20in.png",
    "guest check in": "/amenities/Guest%20Check%20in.png",
    "guest management": "/property-details/amenties/guest-management.png",
    "delivery acceptance": "/amenities/Delivery.png",
    "package notification": "/amenities/Package%20Notification.png",
    
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

// All available amenity icons from `public/amenities` (png files).
const AVAILABLE_ICONS = [
    "/amenities/Tea.png",
    "/amenities/coffee.png",
    "/amenities/milk.png",
    "/amenities/water.png",
    "/amenities/Food%20Vendor.png",
    "/amenities/Cafeteria.png",
    "/amenities/Pantry.png",
    "/amenities/Daily%20Upkeep.png",
    "/amenities/Nightly%20Thrash.png",
    "/amenities/Fire%20%26%20seafty.png",
    "/amenities/security.png",
    "/amenities/wifi.png",
    "/amenities/Guest%20Check%20in.png",
    "/amenities/Delivery.png",
    "/amenities/Package%20Notification.png",
];

// Default icon for unmapped amenities
const DEFAULT_ICON = "/amenities/security.png";

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
    return AVAILABLE_ICONS.includes(iconPath) || iconPath.startsWith('/amenities/');
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
 * Maps an array of amenity strings or objects to an array of amenity objects with name and image.
 * Schema-driven: when amenity has { id, name }, uses /amenities/{id}.svg. Otherwise falls back to legacy PNG mapping.
 * @param {Array} amenities - Array of amenity strings or objects ({ id?, name, category? })
 * @returns {Array} - Array of amenity objects with name and image properties
 */
export function mapAmenitiesToObjects(amenities) {
    if (!Array.isArray(amenities)) {
        return [];
    }
    
    return amenities
        .map(amenity => {
            if (amenity && typeof amenity === 'object' && amenity.name) {
                // Legacy: object with image, or needs mapping
                if (amenity.image && isValidIcon(amenity.image)) {
                    return amenity;
                }
                return {
                    name: amenity.name,
                    image: mapAmenityToObject(amenity.name)?.image || getRandomIcon(amenity.name)
                };
            }
            if (typeof amenity === 'string') {
                return mapAmenityToObject(amenity);
            }
            return null;
        })
        .filter(Boolean);
}

/**
 * Fixed category mapping for All Amenities modal - exactly 6 categories per design.
 * Maps amenity name (normalized) to: guest-services, security, food-beverages, cleaning, productivity, on-credit
 */
export const AMENITY_CATEGORY_MAP = {
    // Guest Services
    "guest check-in": "guest-services",
    "guest checkin": "guest-services",
    "delivery acceptance": "guest-services",
    "package notification": "guest-services",
    "parking": "guest-services",
    "visitor parking": "guest-services",
    "2w parking": "guest-services",
    "4w parking": "guest-services",
    "ev charging": "guest-services",
    "ev charging space": "guest-services",
    "elevator": "guest-services",
    "lift": "guest-services",
    // Security
    "fire safety": "security",
    "guest management": "security",
    "video surveillance": "security",
    "keycard access": "security",
    "cctv": "security",
    "security": "security",
    "security guard": "security",
    "gated community": "security",
    "building security": "security",
    // Food Beverages
    "tea": "food-beverages",
    "coffee": "food-beverages",
    "water": "food-beverages",
    "water supply": "food-beverages",
    "milk & sweeteners": "food-beverages",
    "milk and sweeteners": "food-beverages",
    "cups & mugs": "food-beverages",
    "cups and mugs": "food-beverages",
    "24/7 pantry": "food-beverages",
    "24/7 pantries": "food-beverages",
    "pantry": "food-beverages",
    "cafeteria": "food-beverages",
    "food vendor": "food-beverages",
    // Cleaning
    "daily cleaning": "cleaning",
    "trash removal": "cleaning",
    "deep cleaning": "cleaning",
    "24/7 cleaning": "cleaning",
    "pest control": "cleaning",
    "daily upkeep": "cleaning",
    "nightly trash": "cleaning",
    "nightly trash removal": "cleaning",
    "pest extermination": "cleaning",
    // Productivity
    "power backup": "productivity",
    "power supply": "productivity",
    "dg backup": "productivity",
    "generator backup": "productivity",
    "electricity": "productivity",
    "high-speed wifi": "productivity",
    "high speed wifi": "productivity",
    "wifi": "productivity",
    "wi-fi": "productivity",
    "tape & clips": "productivity",
    "tape and clips": "productivity",
    "sticky notes": "productivity",
    "printing & copying": "productivity",
    "printing and copying": "productivity",
    "stationery": "productivity",
    "paper shredding": "productivity",
    "envelopes": "productivity",
    "printers": "productivity",
    "printer": "productivity",
    "printing": "productivity",
    "copying": "productivity",
    // On Credit
    "phone booths": "on-credit",
    "phone booth": "on-credit",
    "conference rooms": "on-credit",
    "conference room": "on-credit",
    "meeting rooms": "on-credit",
    "meeting room": "on-credit",
    "open desk": "on-credit",
    "open desks": "on-credit",
    "event sponsor": "on-credit",
    "reception area": "on-credit",
    "private cabins": "on-credit",
    "private cabin": "on-credit",
    "recreational area": "on-credit",
};

/** Fixed category order and display labels for All Amenities modal */
export const AMENITY_CATEGORY_ORDER = [
    "guest-services",
    "security",
    "food-beverages",
    "cleaning",
    "productivity",
    "on-credit",
];

export const AMENITY_CATEGORY_LABELS = {
    "guest-services": "Guest Services",
    "security": "Security",
    "food-beverages": "Food Beverages",
    "cleaning": "Cleaning",
    "productivity": "Productivity",
    "on-credit": "On Credit",
};

/** Default category when amenity name doesn't match - ensures no amenity is ever dropped */
const DEFAULT_AMENITY_CATEGORY = "guest-services";

/**
 * Maps schema category values to our 6 fixed display categories.
 * Schema may use: guest-services, security, pantry, utilities, building, cleaning, on-credit
 */
export const SCHEMA_CATEGORY_TO_DISPLAY = {
    "guest-services": "guest-services",
    "guest services": "guest-services",
    security: "security",
    pantry: "food-beverages",
    "food-beverages": "food-beverages",
    "food beverages": "food-beverages",
    cleaning: "cleaning",
    utilities: "productivity",
    productivity: "productivity",
    building: "guest-services",
    "on-credit": "on-credit",
    "on credit": "on-credit",
};

/**
 * Gets category from schema first, then falls back to name-based mapping.
 * Always returns one of the 6 categories. Sync with schema - use schema category directly.
 */
export function getAmenityCategory(amenity, amenityName) {
    const schemaCat = typeof amenity === "object" && amenity?.category ? String(amenity.category).toLowerCase().trim() : null;
    if (schemaCat && SCHEMA_CATEGORY_TO_DISPLAY[schemaCat]) {
        return SCHEMA_CATEGORY_TO_DISPLAY[schemaCat];
    }
    const name = amenityName ?? (typeof amenity === "object" ? amenity?.name : amenity);
    if (!name || typeof name !== "string") return DEFAULT_AMENITY_CATEGORY;
    const key = name.toLowerCase().trim();
    return AMENITY_CATEGORY_MAP[key] || DEFAULT_AMENITY_CATEGORY;
}

export default amenityIconMap;

