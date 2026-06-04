export const shouldHideField = (label, propertyType) => {
    if (!label) return false;
    const normLabel = String(label).toLowerCase().trim();
    const isCommercial = String(propertyType).toLowerCase() === 'commercial';
    
    // Fields to hide for residential
    const resHide = [
        "price negotiable",
        "negotiable",
        "furnishing level",
        "furnishing status",
        "furnishing",
        "offer tag",
        "property type",
        "price per seat",
        "price per sq.ft",
        "price per sq. ft",
        "total seats",
        "number of seats",
        "building lease",
        "min. inventory unit",
        "min inventory unit",
        "max. inventory unit",
        "max inventory unit",
        "single floor capacity",
        "under management",
        "managed by platform",
        "the whole techpark is under your management for office space provision?",
        "available floors",
        "office space solutions"
    ];
    
    // Fields to hide for commercial
    const commHide = [
        "property type",
        "price negotiable",
        "negotiable",
        "offer tag",
        "total seats",
        "total no of seats",
        "number of seats",
        "furnishing level",
        "furnishing status",
        "furnishing",
        "price per seat",
        "price per sq.ft",
        "price per sq. ft",
        "building lease",
        "min. inventory unit",
        "min inventory unit",
        "max. inventory unit",
        "max inventory unit",
        "single floor capacity",
        "under management",
        "managed by platform",
        "the whole techpark is under your management for office space provision?",
        "available floors",
        "office space solutions"
    ];
    
    if (isCommercial) {
        return commHide.includes(normLabel);
    } else {
        return resHide.includes(normLabel);
    }
};

export const getPropertyCategoryAndTypes = (p) => {
    if (!p) return { category: "-", types: [] };
    
    const isCommercial = (p.propertyCategory || p.propertyType || "").toLowerCase() === "commercial";
    const categoryLabel = isCommercial ? "Commercial Property" : "Residential Property";
    
    // Collect all raw type/category/listing strings
    const rawValues = [];
    const fieldsToCollect = [
        p.listingType,
        p.listingTypes,
        p.spaceType,
        p.spaceTypes,
        p.propertyType,
        p.propertyLabel,
        p.category,
        p.Category
    ];
    
    fieldsToCollect.forEach(val => {
        if (!val) return;
        if (Array.isArray(val)) {
            val.forEach(v => {
                if (v && typeof v === 'string') rawValues.push(v.toLowerCase().trim());
            });
        } else if (typeof val === 'string') {
            // Split by commas, slashes, or semicolons
            val.split(/[\s,/;]+/).forEach(v => {
                if (v) rawValues.push(v.toLowerCase().trim());
            });
        }
    });
    
    const matchedTypes = new Set();
    
    if (isCommercial) {
        // Commercial categories: Managed Space, Unmanaged Space, Coworking Shared, Coworking Dedicated
        rawValues.forEach(val => {
            const norm = val.replace(/[-_]/g, ' ');
            if (norm.includes("managed space") || norm === "managed" || norm === "managedspace") {
                matchedTypes.add("Managed Space");
            }
            if (norm.includes("unmanaged space") || norm === "unmanaged" || norm === "unmanagedspace") {
                matchedTypes.add("Unmanaged Space");
            }
            if (norm.includes("coworking shared") || norm.includes("shared coworking") || norm.includes("shared desk") || norm.includes("hot desk") || norm.includes("coworking-shared")) {
                matchedTypes.add("Coworking Shared");
            }
            if (norm.includes("coworking dedicated") || norm.includes("dedicated coworking") || norm.includes("dedicated desk") || norm.includes("coworking-dedicated")) {
                matchedTypes.add("Coworking Dedicated");
            }
        });
        
        // Fallback for general coworking if not classified
        if (matchedTypes.size === 0) {
            rawValues.forEach(val => {
                if (val.includes("coworking")) {
                    matchedTypes.add("Coworking Shared");
                }
            });
        }
    } else {
        // Residential categories: Rent, Sale, PG/Hostel, Flatmates, Co-living
        rawValues.forEach(val => {
            const norm = val.replace(/[-_]/g, ' ');
            if (norm === "rent" || norm.includes("for rent")) {
                matchedTypes.add("Rent");
            }
            if (norm === "sale" || norm.includes("for sale") || norm === "buy") {
                matchedTypes.add("Sale");
            }
            if (norm.includes("pg") || norm.includes("hostel")) {
                matchedTypes.add("PG/Hostel");
            }
            if (norm.includes("flatmate") || norm.includes("flatmates")) {
                matchedTypes.add("Flatmates");
            }
            if (norm.includes("co living") || norm.includes("coliving")) {
                matchedTypes.add("Co-living");
            }
        });
    }
    
    // Fallback: if nothing matches but we have some raw categories, capitalize them
    if (matchedTypes.size === 0) {
        const fallbacks = [...new Set(rawValues)]
            .filter(v => v !== 'commercial' && v !== 'residential' && v !== 'null' && v !== 'undefined')
            .map(v => v.charAt(0).toUpperCase() + v.slice(1));
        if (fallbacks.length > 0) {
            return { category: categoryLabel, types: fallbacks };
        }
        return { category: categoryLabel, types: [isCommercial ? "Commercial Space" : "Residential Space"] };
    }
    
    return { category: categoryLabel, types: Array.from(matchedTypes) };
};
