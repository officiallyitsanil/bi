import { calculatePrices } from '@/utils/priceUtils';
import { getPropertyCategoryAndTypes } from '@/utils/uiVisibility';

export function getNumericPrice(prop) {
  if (!prop) return 0;
  try {
    const calculated = calculatePrices(prop);
    if (calculated?.discountedPrice && calculated.discountedPrice !== '₹XX') {
      const priceStr = String(calculated.discountedPrice).replace(/[₹,]/g, '');
      const val = parseFloat(priceStr);
      if (val > 0) return val;
    }
  } catch (e) {
    console.error('Error in getNumericPrice:', e);
  }
  const p = prop.totalPrice || prop.originalPrice || prop.discountedPrice || prop.expectedRent || prop.price;
  if (!p || p === '₹XX' || p === 'N/A') return 0;
  const priceStr = String(p).replace(/[₹,]/g, '');
  return parseFloat(priceStr) || 0;
}

export function isNewProperty(prop) {
  if (!prop?.createdAt) return false;
  const createdDate = new Date(prop.createdAt);
  if (isNaN(createdDate.getTime())) return false;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return createdDate >= thirtyDaysAgo;
}

export function getRatingTag(ratingVal) {
  const val = parseFloat(ratingVal);
  if (isNaN(val)) return 'Good';
  if (val >= 4.5) return 'Excellent';
  if (val >= 4.0) return 'Moderate';
  return 'Good';
}

export function getPropertyCity(p) {
  const city = p?.address?.city || p?.city || '';
  if (!city) return '';
  return city
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function isCommercialProperty(val) {
  if (!val) return false;
  const v = String(val).toLowerCase();
  return (
    v.includes('commercial') ||
    v.includes('techpark') ||
    v.includes('coworking') ||
    v.includes('office') ||
    v.includes('warehouse') ||
    v.includes('tech-park')
  );
}

export function getSimilarProperties(allProperties, currentProperty) {
  if (!currentProperty || !Array.isArray(allProperties)) return [];

  const currentPrice = getNumericPrice(currentProperty);
  const lowerBound = currentPrice * 0.9;
  const upperBound = currentPrice * 1.1;

  const currentInfo = getPropertyCategoryAndTypes(currentProperty);
  const currentTypes = (currentInfo?.types || []).map((t) => t.toLowerCase());
  const isCurrentComm =
    isCommercialProperty(currentProperty.propertyCategory) ||
    isCommercialProperty(currentProperty.propertyType);

  return allProperties.filter((p) => {
    if (!p) return false;
    const id = p._id || p.id;
    const currentId = currentProperty._id || currentProperty.id;
    if (id === currentId) return false;

    const isVerified = p.verificationStatus === 'verified' || p.verificationStatus === 'confirmed';
    if (!isVerified) return false;

    const isPComm = isCommercialProperty(p.propertyCategory) || isCommercialProperty(p.propertyType);
    if (isCurrentComm !== isPComm) return false;

    const pInfo = getPropertyCategoryAndTypes(p);
    const pTypes = (pInfo?.types || []).map((t) => t.toLowerCase());
    const hasOverlap = pTypes.some((t) => currentTypes.includes(t));
    if (!hasOverlap) return false;

    const pPrice = getNumericPrice(p);
    return pPrice >= lowerBound && pPrice <= upperBound;
  });
}
