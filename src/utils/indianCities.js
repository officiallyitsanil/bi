// Comprehensive list of Indian cities and states for search suggestions
export const indianCities = [
  // Major Metro Cities
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
  
  // State Capitals
  "Jaipur", "Lucknow", "Chandigarh", "Bhopal", "Patna", "Thiruvananthapuram", 
  "Bhubaneswar", "Ranchi", "Dispur", "Gangtok", "Imphal", "Aizawl", "Kohima", 
  "Itanagar", "Shillong", "Agartala", "Panaji", "Shimla", "Srinagar", "Jammu",
  
  // Tier 1 & Tier 2 Cities
  "Noida", "Gurgaon", "Faridabad", "Ghaziabad", "Greater Noida",
  "Indore", "Surat", "Vadodara", "Rajkot", "Nashik", "Nagpur", "Thane",
  "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati",
  "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli",
  "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur",
  "Mysore", "Mangalore", "Hubli", "Belgaum", "Gulbarga",
  "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda",
  "Dehradun", "Haridwar", "Rishikesh", "Roorkee", "Haldwani",
  "Raipur", "Bilaspur", "Durg", "Bhilai", "Korba",
  "Varanasi", "Kanpur", "Agra", "Meerut", "Allahabad", "Bareilly", "Aligarh", "Moradabad",
  "Jodhpur", "Kota", "Bikaner", "Udaipur", "Ajmer",
  "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur",
  
  // Other Important Cities
  "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Akola",
  "Warangal", "Karimnagar", "Nizamabad", "Khammam", "Rajahmundry",
  "Vellore", "Erode", "Thanjavur", "Dindigul", "Thoothukudi",
  "Alappuzha", "Palakkad", "Malappuram", "Kottayam", "Kasaragod",
  "Belgaum", "Davangere", "Bellary", "Bijapur", "Shimoga",
  "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Satna",
  "Dhanbad", "Jamshedpur", "Bokaro", "Giridih", "Hazaribagh",
  "Siliguri", "Durgapur", "Asansol", "Howrah", "Kharagpur",
  "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri",
  "Muzaffarpur", "Bhagalpur", "Gaya", "Darbhanga", "Purnia",
  "Jammu", "Srinagar", "Anantnag", "Baramulla", "Udhampur",
  "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal",
  "Sikar", "Alwar", "Bharatpur", "Bhilwara", "Pali",
  "Ratlam", "Dewas", "Burhanpur", "Khandwa", "Chhindwara",
  "Tiruppur", "Rajapalayam", "Nagercoil", "Karur", "Cuddalore",
  "Anand", "Bharuch", "Jamnagar", "Junagadh", "Gandhinagar", "Mehsana",
  "Nanded", "Latur", "Ahmednagar", "Jalgaon", "Dhule", "Ichalkaranji",
  "Raichur", "Tumkur", "Kolar", "Mandya", "Hassan", "Udupi",
  "Tirunelveli", "Kanchipuram", "Hosur", "Krishnagiri", "Dharmapuri",
  "Puducherry", "Karaikal", "Mahe", "Yanam",
  "Daman", "Diu", "Silvassa",
  "Port Blair", "Kavaratti"
];

// Indian States and Union Territories
export const indianStates = [
  // States
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  
  // Union Territories
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

// Combined list for search
export const allLocations = [...indianCities, ...indianStates];

// Function to get suggestions based on search query
export const getLocationSuggestions = (query, limit = 5) => {
  if (!query || query.trim().length < 1) {
    return [];
  }

  const searchQuery = query.toLowerCase().trim();
  
  // Filter locations that match the query
  const matches = allLocations.filter(location => 
    location.toLowerCase().includes(searchQuery)
  );

  // Sort by relevance (starts with query first, then contains query)
  const sorted = matches.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    const aStarts = aLower.startsWith(searchQuery);
    const bStarts = bLower.startsWith(searchQuery);
    
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return a.localeCompare(b);
  });

  // Return limited results with formatted display text
  return sorted.slice(0, limit).map(location => ({
    text: location,
    displayText: query.trim().length >= 2 ? `${location}, India` : location,
    type: indianStates.includes(location) ? 'state' : 'city'
  }));
};
