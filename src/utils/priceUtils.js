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

  const discountedPriceValue = property?.discountPercent
    ? originalPriceValue * (1 - property.discountPercent / 100)
    : originalPriceValue > 0 ? originalPriceValue * 0.95 : 0;

  const formatPrice = (price) => {
    if (price === 0) return '₹XX';
    return `₹${Math.round(price).toLocaleString('en-IN')}`;
  };

  // Schema: pricePerSeat - compute discounted per-seat when discountPercent exists
  const rawPricePerSeat = property?.pricePerSeat || property?.floorConfigurations?.[0]?.dedicatedCabin?.pricePerSeat;
  const perSeatNum = rawPricePerSeat ? parseFloat(String(rawPricePerSeat).replace(/[₹,]/g, '')) || 0 : 0;
  const originalPricePerSeat = rawPricePerSeat ?? null;
  const discountedPricePerSeat = rawPricePerSeat
    ? (property?.discountPercent ? formatPrice(perSeatNum * (1 - property.discountPercent / 100)) : rawPricePerSeat)
    : null;

  return {
    originalPrice: formatPrice(originalPriceValue),
    discountedPrice: formatPrice(discountedPriceValue),
    pricePerSqft: property?.pricePerSqft ?? null,
    pricePerSeat: property?.pricePerSeat ?? null,
    originalPricePerSeat,
    discountedPricePerSeat,
    isNegotiablePrice: property?.isNegotiablePrice ?? null,
  };
}
