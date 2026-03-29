import commercialRaw from '@/dummy/commercial-properties.json';
import residentialRaw from '@/dummy/residential-properties.json';

/** Toggle off to use MongoDB-backed routes again. */
export const USE_DUMMY_PROPERTIES = true;

export function getCommercialDummy() {
  return Array.isArray(commercialRaw) ? commercialRaw : [];
}

export function getResidentialDummy() {
  return Array.isArray(residentialRaw) ? residentialRaw : [];
}

export function getAllDummyPropertiesRaw() {
  return [...getCommercialDummy(), ...getResidentialDummy()];
}

function listingToCommercialCategory(listingType) {
  if (!listingType) return 'managed space';
  const s = String(listingType).toLowerCase().replace(/-/g, ' ');
  if (s.includes('managed')) return 'managed space';
  if (s.includes('cowork')) return 'coworking shared';
  return 'managed space';
}

/**
 * Aligns dummy JSON with fields the filtered API expects (Category vs category).
 */
export function enrichDummyForFilter(prop) {
  const pc = (prop.propertyCategory || '').toLowerCase();
  const cap = pc === 'commercial' ? 'Commercial' : 'Residential';
  
  // Map images to featuredImageUrl for dummy data compatibility
  let featuredImageUrl = prop.featuredImageUrl;
  if (!featuredImageUrl && Array.isArray(prop.images) && prop.images.length > 0) {
    featuredImageUrl = prop.images[0];
  }

  const out = {
    ...prop,
    _id: String(prop._id || prop.id),
    id: String(prop._id || prop.id),
    Category: prop.Category || cap,
    featuredImageUrl: featuredImageUrl,
  };

  if (pc === 'commercial') {
    out.category = prop.category || listingToCommercialCategory(prop.listingType);
  } else {
    out.selectedType = prop.selectedType || 'sale';
  }
  return out;
}

export function findDummyPropertyById(id, type) {
  const sid = String(id);
  if (type === 'commercial') {
    return getCommercialDummy().find((p) => String(p._id) === sid) || null;
  }
  if (type === 'residential') {
    return getResidentialDummy().find((p) => String(p._id) === sid) || null;
  }
  return getAllDummyPropertiesRaw().find((p) => String(p._id) === sid) || null;
}
