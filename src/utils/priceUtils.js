/**
 * Price utilities - sync with schema: totalPrice, discountPercent, pricePerSeat, pricePerSqft
 * Computes originalPrice and discountedPrice for UI display
 */

/**
 * Calculate original and discounted prices from schema fields
 * @param {Object} property - property with totalPrice, discountPercent, pricePerSeat, pricePerSqft, etc.
 * @returns {{ originalPrice: string, discountedPrice: string, pricePerSqft: string, pricePerSeat: string }}
 */
export function calculatePrices(property) {
  let originalPriceValue = 0;
  const cat = property?.propertyCategory || property?.propertyType;
  const isResidential = cat === 'residential';

  // Schema: totalPrice is the original/base price
  if (property?.totalPrice) {
    originalPriceValue = parseFloat(String(property.totalPrice).replace(/[₹,]/g, '')) || 0;
  }
  if (originalPriceValue === 0 && property?.originalPrice) {
    originalPriceValue = parseFloat(String(property.originalPrice).replace(/[₹,]/g, '')) || 0;
  }
  if (originalPriceValue === 0 && isResidential && property?.expectedRent) {
    originalPriceValue = parseFloat(String(property.expectedRent).replace(/[₹,]/g, '')) || 0;
  }
  if (originalPriceValue === 0 && !isResidential) {
    const seats = property?.numberOfSeats || property?.floorConfigurations?.[0]?.dedicatedCabin?.seats;
    const pricePerSeat = property?.pricePerSeat || property?.floorConfigurations?.[0]?.dedicatedCabin?.pricePerSeat;
    if (seats && pricePerSeat) {
      const s = String(seats).match(/(\d+)/)?.[1];
      const p = String(pricePerSeat).match(/(\d+)/)?.[1];
      if (s && p) originalPriceValue = parseFloat(s) * parseFloat(p);
    }
  }

  // Left price (actual/discounted) = totalPrice
  const discountedPriceValue = originalPriceValue;

  // Right price (original/strike-through) = totalPrice * 1.1 (increase by 10% markup)
  const calculatedOriginalPriceValue = originalPriceValue > 0 ? originalPriceValue * 1.1 : 0;

  const formatPrice = (price) => {
    if (price === 0) return '₹XX';
    return `₹${Math.round(price).toLocaleString('en-IN')}`;
  };

  // Schema: pricePerSeat - show originalPrice * 1.1 and discountedPrice mapped to totalPrice
  const originalPricePerSeat = formatPrice(calculatedOriginalPriceValue);
  const discountedPricePerSeat = formatPrice(discountedPriceValue);

  return {
    originalPrice: formatPrice(calculatedOriginalPriceValue),
    discountedPrice: formatPrice(discountedPriceValue),
    pricePerSqft: property?.pricePerSqft ?? null,
    pricePerSeat: formatPrice(discountedPriceValue), // Show totalPrice for pricePerSeat too!
    originalPricePerSeat,
    discountedPricePerSeat,
    isNegotiablePrice: property?.isNegotiablePrice ?? null,
  };
}
