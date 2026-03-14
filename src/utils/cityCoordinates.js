// Approximate lat/lng for major Indian cities - used to sort "Closer Cities" by distance
export const cityCoordinates = {
  // Top Cities
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Delhi: { lat: 28.7041, lng: 77.1025 },
  Gurgaon: { lat: 28.4595, lng: 77.0266 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Lucknow: { lat: 26.8467, lng: 80.9462 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  'Navi Mumbai': { lat: 19.033, lng: 73.0297 },
  Noida: { lat: 28.5355, lng: 77.391 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Thane: { lat: 19.2183, lng: 72.9781 },
  // Other major cities
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Chandigarh: { lat: 30.7333, lng: 76.7794 },
  Bhopal: { lat: 23.2599, lng: 77.4126 },
  Patna: { lat: 25.5941, lng: 85.1376 },
  Thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
  Bhubaneswar: { lat: 20.2961, lng: 85.8245 },
  Ranchi: { lat: 23.3441, lng: 85.3096 },
  Faridabad: { lat: 28.4089, lng: 77.3178 },
  Ghaziabad: { lat: 28.6692, lng: 77.4538 },
  'Greater Noida': { lat: 28.4744, lng: 77.504 },
  Indore: { lat: 22.7196, lng: 75.8577 },
  Surat: { lat: 21.1702, lng: 72.8311 },
  Vadodara: { lat: 22.3072, lng: 73.1812 },
  Rajkot: { lat: 22.3039, lng: 70.8022 },
  Nashik: { lat: 19.9975, lng: 73.7898 },
  Nagpur: { lat: 21.1458, lng: 79.0882 },
  Visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  Vijayawada: { lat: 16.5062, lng: 80.648 },
  Coimbatore: { lat: 11.0168, lng: 76.9558 },
  Madurai: { lat: 9.9252, lng: 78.1198 },
  Kochi: { lat: 9.9312, lng: 76.2673 },
  Kozhikode: { lat: 11.2588, lng: 75.7804 },
  Mysore: { lat: 12.2958, lng: 76.6394 },
  Mangalore: { lat: 12.9141, lng: 74.856 },
  Ludhiana: { lat: 30.901, lng: 75.8573 },
  Amritsar: { lat: 31.634, lng: 74.8723 },
  Dehradun: { lat: 30.3165, lng: 78.0322 },
  Raipur: { lat: 21.2514, lng: 81.6296 },
  Varanasi: { lat: 25.3176, lng: 82.9739 },
  Kanpur: { lat: 26.4499, lng: 80.3319 },
  Agra: { lat: 27.1767, lng: 78.0081 },
  Meerut: { lat: 28.9845, lng: 77.7064 },
  Allahabad: { lat: 25.4358, lng: 81.8463 },
  Jodhpur: { lat: 26.2389, lng: 73.0243 },
  Kota: { lat: 25.2138, lng: 75.8648 },
  Udaipur: { lat: 24.5854, lng: 73.7125 },
  Guwahati: { lat: 26.1445, lng: 91.7362 },
  Aurangabad: { lat: 19.8762, lng: 75.3433 },
  Warangal: { lat: 17.9689, lng: 79.5941 },
  Jabalpur: { lat: 23.1815, lng: 79.9864 },
  Gwalior: { lat: 26.2183, lng: 78.1828 },
  Siliguri: { lat: 26.7271, lng: 88.3953 },
  Durgapur: { lat: 23.5204, lng: 87.3119 },
  Asansol: { lat: 23.6739, lng: 86.9524 },
  Howrah: { lat: 22.5958, lng: 88.2636 },
  Cuttack: { lat: 20.4625, lng: 85.883 },
  Rourkela: { lat: 22.2562, lng: 84.8546 },
  Gandhinagar: { lat: 23.2156, lng: 72.6369 },
  Srinagar: { lat: 34.0837, lng: 74.7973 },
  Jammu: { lat: 32.7266, lng: 74.857 },
  Panipat: { lat: 29.3909, lng: 76.9635 },
  Panaji: { lat: 15.4909, lng: 73.8278 },
  Shimla: { lat: 31.1048, lng: 77.1734 },
  Puducherry: { lat: 11.9416, lng: 79.8083 },
};

// Haversine distance in km
export function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function sortCitiesByDistance(cities, userLat, userLng, maxCount = 12) {
  return cities
    .filter(city => cityCoordinates[city])
    .map(city => ({
      city,
      dist: getDistanceKm(userLat, userLng, cityCoordinates[city].lat, cityCoordinates[city].lng)
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, maxCount)
    .map(({ city }) => city);
}
