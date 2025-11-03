// Shared property data for consistent flow across home page, modal, and property details

// Base property templates
const commercialBase = {
  id: '1',
  propertyType: 'commercial',
  state_name: 'Telangana',
  coordinates: { lat: 17.4065, lng: 78.4772 },
  position: { lat: 17.4065, lng: 78.4772 },
  name: 'Premium Business Hub',
  originalPrice: '₹95,00,000',
  discountedPrice: '₹90,00,000',
  additionalPrice: '₹5,00,000',
  images: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop'
  ],
  featuredImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
  date_added: '10 December 2024',
  is_verified: true,
  sellerPhoneNumber: '+91 9876543211',
  layer_location: 'Madhapur',
  location_district: 'Hyderabad',
  // Property details page specific data
  address: 'Madhapur, Hyderabad, Telangana 500081, India',
  amenities: [
    { name: 'OC Certificate', image: '/property-details/amenties/oc.png' },
    { name: 'SEZ Approved', image: '/property-details/amenties/sez.png' },
    { name: 'Fire NOC', image: '/property-details/amenties/fire-noc.png' },
    { name: 'Water Supply', image: '/property-details/amenties/water-supply.png' },
    { name: 'HVAC', image: '/property-details/amenties/hvac.png' },
    { name: 'Electricity', image: '/property-details/amenties/electricity.png' },
    { name: 'Elevators', image: '/property-details/amenties/elevator.png' },
    { name: 'Sewage System', image: '/property-details/amenties/sewage-system.png' },
    { name: 'Property Insurance', image: '/property-details/amenties/property-insurance.png' },
    { name: 'Power Supply 24/7', image: '/property-details/amenties/power-supply.png' },
    { name: 'Fire Alarm', image: '/property-details/amenties/fire-alarm.png' },
    { name: 'Smoke Detector', image: '/property-details/amenties/smoke-detector.png' },
    { name: '2W Parking', image: '/property-details/amenties/2wparking.png' },
    { name: '4W Parking', image: '/property-details/amenties/4wparking.png' },
    { name: 'Visitor Parking', image: '/property-details/amenties/visitor-parking.png' },
    { name: 'Building Security', image: '/property-details/amenties/building-security.png' },
    { name: 'First Aid Kit', image: '/property-details/amenties/first-aidkit.png' },
    { name: 'DG Backup', image: '/property-details/amenties/dg-backup.png' },
    { name: 'Extinguisher', image: '/property-details/amenties/fire-extinguisher.png' },
    { name: 'EV Charging Space', image: '/property-details/amenties/ev-charging-space.png' },
    { name: 'Accessible To Persons with Disabilities', image: '/property-details/amenties/accessable.png' },
    { name: 'Building Permit', image: '/property-details/amenties/permit.png' },
    { name: 'Guest check-in/ Registration', image: '/property-details/amenties/guest-checkin.png' },
    { name: 'Waste Disposal', image: '/property-details/amenties/nighty-trash.png' },
    { name: 'Delivery acceptance/notification', image: '/property-details/amenties/delivery-acceptance.png' },
    { name: 'CCTV', image: '/property-details/amenties/security-guard.png' },
    { name: 'Package notification', image: '/property-details/amenties/package-notification.png' },
    { name: 'Intercom', image: '/property-details/amenties/guest-management.png' },
    { name: 'Guest management / keycard access', image: '/property-details/amenties/guest-management.png' },
    { name: 'Security guards and video surveillance', image: '/property-details/amenties/security-guard.png' },
    { name: 'Tea', image: '/property-details/amenties/tea.png' },
    { name: 'Coffee', image: '/property-details/amenties/coffee.png' },
    { name: 'Water', image: '/property-details/amenties/water.png' },
    { name: 'Milk / Sweeteners', image: '/property-details/amenties/milk.png' },
    { name: 'Cups, mugs, and more', image: '/property-details/amenties/cups-mugs.png' },
    { name: 'Food Vendor', image: '/property-details/amenties/food-vendor.png' },
    { name: 'Daily upkeep of bathrooms, pantries, conference rooms, and common areas', image: '/property-details/amenties/daily-upkeep.png' },
    { name: 'Nightly trash removal from offices, conference rooms, and common areas ', image: '/property-details/amenties/nighty-trash.png' },
    { name: 'Deep - cleaning of offices on a weekly basis', image: '/property-details/amenties/deep-cleaning.png' },
    { name: 'Pest extermination', image: '/property-details/amenties/pest-extermination.png' },
    { name: '24 / 7 general cleaning ', image: '/property-details/amenties/general-cleaning.png' },
    { name: 'High - speed wi-fi 24/7', image: '/property-details/amenties/wifi.png' },
    { name: 'Tape and paper clips', image: '/property-details/amenties/tape-paper.png' },
    { name: 'Sticky notes', image: '/property-details/amenties/sticky-notes.png' },
    { name: 'Printers and copiers', image: '/property-details/amenties/printers.png' },
    { name: 'Paper shredding', image: '/property-details/amenties/paper-shreding.png' },
    { name: 'Envelopes', image: '/property-details/amenties/enevelopes.png' },
    { name: 'Open desk', image: '/property-details/amenties/open-desk.png' }
  ],
  nearbyPlaces: {
    school: [
      { name: 'International School of Hyderabad', location: 'Madhapur', distance: '1.2 km >' },
      { name: 'Oakridge International School', location: 'Gachibowli', distance: '2.5 km >' },
      { name: 'Chirec International School', location: 'Kondapur', distance: '3.1 km >' },
      { name: 'Delhi Public School', location: 'Nacharam', distance: '4.8 km >' },
      { name: 'Bharatiya Vidya Bhavan', location: 'Jubilee Hills', distance: '5.2 km >' },
      { name: 'Meridian School', location: 'Banjara Hills', distance: '6.1 km >' }
    ],
    hospital: [
      { name: 'Apollo Hospitals', location: 'Jubilee Hills', distance: '4.2 km >' },
      { name: 'KIMS Hospital', location: 'Kondapur', distance: '2.8 km >' },
      { name: 'Continental Hospitals', location: 'Gachibowli', distance: '3.5 km >' },
      { name: 'Yashoda Hospitals', location: 'Somajiguda', distance: '7.3 km >' },
      { name: 'Care Hospitals', location: 'Banjara Hills', distance: '6.8 km >' },
      { name: 'Rainbow Children Hospital', location: 'Madhapur', distance: '1.8 km >' }
    ],
    hotel: [
      { name: 'Hyatt Hyderabad Gachibowli', location: 'Gachibowli', distance: '2.0 km >' },
      { name: 'Marriott Hyderabad', location: 'Gachibowli', distance: '2.3 km >' },
      { name: 'Westin Hyderabad Mindspace', location: 'Madhapur', distance: '1.5 km >' },
      { name: 'Radisson Blu Plaza', location: 'Banjara Hills', distance: '5.9 km >' },
      { name: 'Park Hyatt Hyderabad', location: 'Banjara Hills', distance: '6.2 km >' },
      { name: 'Sheraton Hyderabad Hotel', location: 'Gachibowli', distance: '2.7 km >' }
    ],
    business: [
      { name: 'HITEC City', location: 'Madhapur', distance: '0.8 km >' },
      { name: 'Mindspace IT Park', location: 'Madhapur', distance: '1.0 km >' },
      { name: 'DLF Cyber City', location: 'Gachibowli', distance: '2.2 km >' },
      { name: 'Raheja Mindspace', location: 'Madhapur', distance: '1.3 km >' },
      { name: 'Cyber Towers', location: 'Madhapur', distance: '1.1 km >' },
      { name: 'Salarpuria Sattva Knowledge City', location: 'Raidurg', distance: '3.4 km >' }
    ]
  },
  floorPlans: {
    '6-15 Seats': [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop'
    ],
    '16-30 Seats': [
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=600&h=400&fit=crop'
    ],
    '31-60 Seats': [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop'
    ]
  },
  ratings: {
    overall: 4.5,
    totalRatings: 32,
    breakdown: { 5: 18, 4: 10, 3: 3, 2: 1, 1: 0 },
    whatsGood: [
      'Prime IT Hub Location',
      'Excellent Connectivity',
      'Modern Infrastructure',
      'Professional Environment',
      'Metro Connectivity'
    ],
    whatsBad: ['High Rental Cost', 'Traffic Congestion']
  },
  reviews: [
    {
      user: 'User',
      rating: 2,
      date: 'Aug 17, 2025',
      comment: 'Business Hubs & Offices in Close Proximity.'
    },
    {
      user: 'User',
      rating: 5,
      date: 'Jul 24, 2025',
      comment: 'Near Metro of Good Public Transport. Near Metross of Good Public Transport.'
    },
    {
      user: 'User',
      rating: 5,
      date: 'Jul 24, 2025',
      comment: 'Good review'
    },
    {
      user: 'User',
      rating: 4,
      date: 'Jul 24, 2025',
      comment: 'Best review'
    },
    {
      user: 'User',
      rating: 4,
      date: 'Jul 24, 2025',
      comment: 'Best review'
    },
    {
      user: 'User',
      rating: 5,
      date: 'Jul 20, 2025',
      comment: 'Excellent property with modern amenities. Highly recommended for businesses.'
    },
    {
      user: 'User',
      rating: 3,
      date: 'Jul 18, 2025',
      comment: 'Good location but parking can be challenging during peak hours.'
    },
    {
      user: 'User',
      rating: 5,
      date: 'Jul 15, 2025',
      comment: 'Perfect office space with all necessary facilities. Great connectivity to metro.'
    },
    {
      user: 'User',
      rating: 4,
      date: 'Jul 12, 2025',
      comment: 'Nice property with professional environment. Good for startups.'
    },
    {
      user: 'User',
      rating: 5,
      date: 'Jul 10, 2025',
      comment: 'Outstanding infrastructure and security. Worth every penny.'
    },
    {
      user: 'User',
      rating: 4,
      date: 'Jul 8, 2025',
      comment: 'Great location in IT hub. Easy access to restaurants and cafes.'
    },
    {
      user: 'User',
      rating: 3,
      date: 'Jul 5, 2025',
      comment: 'Decent property but could use better maintenance in common areas.'
    },
    {
      user: 'User',
      rating: 5,
      date: 'Jul 3, 2025',
      comment: 'Fantastic office space with excellent amenities. Very satisfied with the property.'
    },
    {
      user: 'User',
      rating: 4,
      date: 'Jul 1, 2025',
      comment: 'Good value for money. Professional setup with modern facilities.'
    },
    {
      user: 'User',
      rating: 5,
      date: 'Jun 28, 2025',
      comment: 'Amazing property! Clean, well-maintained, and in a prime location.'
    },
    {
      user: 'User',
      rating: 2,
      date: 'Jun 25, 2025',
      comment: 'Property is good but rental cost is quite high compared to nearby options.'
    },
    {
      user: 'User',
      rating: 4,
      date: 'Jun 22, 2025',
      comment: 'Nice commercial space with good ventilation and natural light.'
    },
    {
      user: 'User',
      rating: 5,
      date: 'Jun 20, 2025',
      comment: 'Excellent property management and responsive staff. Highly recommended.'
    },
    {
      user: 'User',
      rating: 4,
      date: 'Jun 18, 2025',
      comment: 'Good office space with reliable power backup and internet connectivity.'
    },
    {
      user: 'User',
      rating: 3,
      date: 'Jun 15, 2025',
      comment: 'Average property. Location is good but facilities need improvement.'
    }
  ]
};

const residentialBase = {
  id: '2',
  propertyType: 'residential',
  state_name: 'Telangana',
  coordinates: { lat: 17.3850, lng: 78.4867 },
  position: { lat: 17.3850, lng: 78.4867 },
  name: 'Luxury Residential Plot',
  originalPrice: '₹2,50,00,000',
  discountedPrice: '₹2,27,50,000',
  additionalPrice: '₹15,00,000',
  images: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800&h=600&fit=crop'
  ],
  featuredImageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
  date_added: '15 December 2024',
  is_verified: true,
  sellerPhoneNumber: '+91 9876543210',
  layer_location: 'Gachibowli',
  location_district: 'Hyderabad',
  // Property details page specific data
  address: 'Gachibowli, Hyderabad, Telangana 500032, India',
  amenities: [
    { name: 'Water Supply', image: '/property-details/amenties/water-supply.png' },
    { name: 'Electricity', image: '/property-details/amenties/electricity.png' },
    { name: 'Sewage System', image: '/property-details/amenties/sewage-system.png' },
    { name: 'Property Insurance', image: '/property-details/amenties/property-insurance.png' },
    { name: 'Power Supply 24/7', image: '/property-details/amenties/power-supply.png' },
    { name: '2W Parking', image: '/property-details/amenties/2wparking.png' },
    { name: '4W Parking', image: '/property-details/amenties/4wparking.png' },
    { name: 'Visitor Parking', image: '/property-details/amenties/visitor-parking.png' },
    { name: 'Building Security', image: '/property-details/amenties/building-security.png' },
    { name: 'First Aid Kit', image: '/property-details/amenties/first-aidkit.png' },
    { name: 'DG Backup', image: '/property-details/amenties/dg-backup.png' },
    { name: 'Extinguisher', image: '/property-details/amenties/fire-extinguisher.png' },
    { name: 'EV Charging Space', image: '/property-details/amenties/ev-charging-space.png' },
    { name: 'Accessible To Persons with Disabilities', image: '/property-details/amenties/accessable.png' },
    { name: 'Building Permit', image: '/property-details/amenties/permit.png' },
    { name: 'Guest check-in/ Registration', image: '/property-details/amenties/guest-checkin.png' },
    { name: 'Waste Disposal', image: '/property-details/amenties/nighty-trash.png' },
    { name: 'CCTV', image: '/property-details/amenties/security-guard.png' },
    { name: 'Intercom', image: '/property-details/amenties/guest-management.png' },
    { name: 'Security guards and video surveillance', image: '/property-details/amenties/security-guard.png' },
    { name: 'High - speed wi-fi 24/7', image: '/property-details/amenties/wifi.png' },
    { name: '24 / 7 general cleaning ', image: '/property-details/amenties/general-cleaning.png' }
  ],
  nearbyPlaces: {
    school: [
      { name: 'Oakridge International School', location: 'Gachibowli', distance: '0.8 km >' },
      { name: 'Chirec International School', location: 'Kondapur', distance: '2.1 km >' },
      { name: 'Indus International School', location: 'Shankarpally', distance: '4.5 km >' },
      { name: 'International School of Hyderabad', location: 'Madhapur', distance: '3.5 km >' },
      { name: 'Glendale Academy', location: 'Miyapur', distance: '5.8 km >' },
      { name: 'Sancta Maria International School', location: 'Attapur', distance: '7.2 km >' }
    ],
    hospital: [
      { name: 'Continental Hospitals', location: 'Gachibowli', distance: '1.5 km >' },
      { name: 'Apollo Hospitals', location: 'Jubilee Hills', distance: '6.2 km >' },
      { name: 'KIMS Hospital', location: 'Kondapur', distance: '3.8 km >' },
      { name: 'Medicover Hospitals', location: 'Madhapur', distance: '3.2 km >' },
      { name: 'AIG Hospitals', location: 'Gachibowli', distance: '2.1 km >' },
      { name: 'Global Hospitals', location: 'Lakdi-ka-pul', distance: '8.5 km >' }
    ],
    hotel: [
      { name: 'Hyatt Hyderabad Gachibowli', location: 'Gachibowli', distance: '1.2 km >' },
      { name: 'Marriott Hyderabad', location: 'Gachibowli', distance: '1.8 km >' },
      { name: 'Novotel Hyderabad', location: 'Gachibowli', distance: '2.0 km >' },
      { name: 'Westin Hyderabad Mindspace', location: 'Madhapur', distance: '3.5 km >' },
      { name: 'Courtyard by Marriott', location: 'Madhapur', distance: '3.8 km >' },
      { name: 'Four Points by Sheraton', location: 'Kukatpally', distance: '6.5 km >' }
    ],
    business: [
      { name: 'DLF Cyber City', location: 'Gachibowli', distance: '1.0 km >' },
      { name: 'Mindspace IT Park', location: 'Madhapur', distance: '3.2 km >' },
      { name: 'HITEC City', location: 'Madhapur', distance: '3.8 km >' },
      { name: 'Nanakramguda Financial District', location: 'Nanakramguda', distance: '2.5 km >' },
      { name: 'Wipro Corporate Office', location: 'Gachibowli', distance: '1.8 km >' },
      { name: 'Microsoft India Development Center', location: 'Gachibowli', distance: '2.3 km >' }
    ]
  },
  floorPlans: {
    '6-15 Seats': [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&h=400&fit=crop'
    ],
    '16-30 Seats': [
      'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop'
    ],
    '31-60 Seats': [
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'
    ]
  },
  ratings: {
    overall: 4.2,
    totalRatings: 24,
    breakdown: { 5: 10, 4: 12, 3: 2, 2: 0, 1: 0 },
    whatsGood: [
      'Prime Residential Location',
      'Good Connectivity',
      'Peaceful Environment',
      'Investment Potential',
      'Infrastructure Development'
    ],
    whatsBad: ['Distance from City Center', 'Limited Public Transport']
  },
  reviews: [
    {
      user: 'User',
      rating: 5,
      date: 'Aug 20, 2025',
      comment: 'Excellent location with great amenities. Perfect for families.'
    },
    {
      user: 'User',
      rating: 4,
      date: 'Aug 15, 2025',
      comment: 'Good property with peaceful surroundings. Highly recommended.'
    },
    {
      user: 'User',
      rating: 5,
      date: 'Aug 10, 2025',
      comment: 'Amazing infrastructure and connectivity. Worth the investment.'
    },
    {
      user: 'User',
      rating: 4,
      date: 'Aug 5, 2025',
      comment: 'Nice residential area with good facilities.'
    },
    {
      user: 'User',
      rating: 3,
      date: 'Jul 30, 2025',
      comment: 'Decent property but a bit far from city center.'
    },
    {
      user: 'User',
      rating: 5,
      date: 'Jul 28, 2025',
      comment: 'Beautiful residential plot with excellent connectivity. Great for building dream home.'
    },
    {
      user: 'User',
      rating: 4,
      date: 'Jul 25, 2025',
      comment: 'Good investment opportunity. Peaceful neighborhood with all amenities nearby.'
    },
    {
      user: 'User',
      rating: 5,
      date: 'Jul 22, 2025',
      comment: 'Perfect location for residential property. Close to schools and hospitals.'
    },
    {
      user: 'User',
      rating: 3,
      date: 'Jul 20, 2025',
      comment: 'Nice plot but price is slightly on the higher side.'
    },
    {
      user: 'User',
      rating: 4,
      date: 'Jul 18, 2025',
      comment: 'Great property with good potential. Recommended for long-term investment.'
    },
    {
      user: 'User',
      rating: 5,
      date: 'Jul 15, 2025',
      comment: 'Excellent residential area with modern infrastructure. Very satisfied.'
    },
    {
      user: 'User',
      rating: 4,
      date: 'Jul 12, 2025',
      comment: 'Good plot with clear documentation. Peaceful environment.'
    },
    {
      user: 'User',
      rating: 5,
      date: 'Jul 10, 2025',
      comment: 'Outstanding property! Perfect for building a luxury home.'
    },
    {
      user: 'User',
      rating: 3,
      date: 'Jul 8, 2025',
      comment: 'Average property. Location is good but needs better road connectivity.'
    },
    {
      user: 'User',
      rating: 4,
      date: 'Jul 5, 2025',
      comment: 'Nice residential plot in a developing area. Good for future investment.'
    },
    {
      user: 'User',
      rating: 5,
      date: 'Jul 3, 2025',
      comment: 'Fantastic property with all amenities. Highly recommended for families.'
    },
    {
      user: 'User',
      rating: 4,
      date: 'Jul 1, 2025',
      comment: 'Good value for money. Clean and well-maintained area.'
    },
    {
      user: 'User',
      rating: 5,
      date: 'Jun 28, 2025',
      comment: 'Amazing location with great connectivity. Perfect for residential development.'
    },
    {
      user: 'User',
      rating: 4,
      date: 'Jun 25, 2025',
      comment: 'Nice property with good infrastructure. Recommended for investment.'
    },
    {
      user: 'User',
      rating: 3,
      date: 'Jun 22, 2025',
      comment: 'Decent plot but could be better maintained. Location is the main advantage.'
    }
  ]
};

// Export the full properties array
export const propertiesData = [
  // --- Original Property 1: Commercial Hub (Madhapur) ---
  commercialBase,

  // --- Original Property 2: Residential Plot (Gachibowli) ---
  residentialBase,

  // --- Replication 1 of Property 1: Commercial Hub (Hitech City) ---
  {
    ...commercialBase, // Spread all existing properties from original 1
    id: '3',
    coordinates: { lat: 17.4475, lng: 78.3752 }, // Hitech City area
    position: { lat: 17.4475, lng: 78.3752 },
    name: 'Tech Park Office Space',
    layer_location: 'Kondapur',
    address: 'Kondapur, Hyderabad, Telangana 500084, India',
    reviews: [
      ...commercialBase.reviews,
      {
        user: 'User',
        rating: 5,
        date: 'Sep 1, 2025',
        comment: 'Brand new construction and great access to Outer Ring Road.'
      },
    ]
  },

  // --- Replication 2 of Property 1: Commercial Hub (Banjara Hills) ---
  {
    ...commercialBase,
    id: '4',
    coordinates: { lat: 17.4147, lng: 78.4419 }, // Banjara Hills area
    position: { lat: 17.4147, lng: 78.4419 },
    name: 'Corporate Tower Suites',
    layer_location: 'Banjara Hills',
    location_district: 'Hyderabad',
    address: 'Banjara Hills, Hyderabad, Telangana 500034, India',
    originalPrice: '₹1,10,00,000', // Slight price variation
    discountedPrice: '₹1,05,00,000',
  },

  // --- Replication 3 of Property 1: Commercial Hub (Kukatpally) ---
  {
    ...commercialBase,
    id: '5',
    coordinates: { lat: 17.4947, lng: 78.3976 }, // Kukatpally area
    position: { lat: 17.4947, lng: 78.3976 },
    name: 'Industrial & Office Complex',
    layer_location: 'Kukatpally',
    address: 'Kukatpally, Hyderabad, Telangana 500072, India',
    sellerPhoneNumber: '+91 9876543213',
    ratings: {
      ...commercialBase.ratings,
      overall: 4.0, // Slight rating variation
      totalRatings: 40,
    },
  },

  // --- Replication 4 of Property 1: Commercial Hub (Jubilee Hills) ---
  {
    ...commercialBase,
    id: '6',
    coordinates: { lat: 17.4332, lng: 78.4061 }, // Jubilee Hills area
    position: { lat: 17.4332, lng: 78.4061 },
    name: 'Prime Retail & Commercial Space',
    layer_location: 'Jubilee Hills',
    address: 'Jubilee Hills, Hyderabad, Telangana 500033, India',
    originalPrice: '₹1,25,00,000', // Higher price variation
    discountedPrice: '₹1,20,00,000',
    date_added: '15 January 2025',
  },

  // --- Replication 1 of Property 2: Residential Plot (Kondapur) ---
  {
    ...residentialBase, // Spread all existing properties from original 2
    id: '7',
    coordinates: { lat: 17.4646, lng: 78.3734 }, // Kondapur area
    position: { lat: 17.4646, lng: 78.3734 },
    name: 'Serene Residential Plot',
    layer_location: 'Kondapur',
    address: 'Kondapur, Hyderabad, Telangana 500084, India',
    reviews: [
      ...residentialBase.reviews,
      {
        user: 'User',
        rating: 5,
        date: 'Sep 5, 2025',
        comment: 'Peaceful area close to IT corridor. Great connectivity.'
      },
    ]
  },

  // --- Replication 2 of Property 2: Residential Plot (Nanakramguda) ---
  {
    ...residentialBase,
    id: '8',
    coordinates: { lat: 17.4300, lng: 78.3770 }, // Nanakramguda area
    position: { lat: 17.4300, lng: 78.3770 },
    name: 'Financial District Residential Land',
    layer_location: 'Nanakramguda',
    address: 'Nanakramguda, Hyderabad, Telangana 500032, India',
    originalPrice: '₹3,00,00,000', // Higher price variation
    discountedPrice: '₹2,75,00,000',
  },

  // --- Replication 3 of Property 2: Residential Plot (Manikonda) ---
  {
    ...residentialBase,
    id: '9',
    coordinates: { lat: 17.4162, lng: 78.3970 }, // Manikonda area
    position: { lat: 17.4162, lng: 78.3970 },
    name: 'Premium Housing Development Plot',
    layer_location: 'Manikonda',
    address: 'Manikonda, Hyderabad, Telangana 500089, India',
    sellerPhoneNumber: '+91 9876543217',
    ratings: {
      ...residentialBase.ratings,
      overall: 4.8, // Higher rating
    },
  },

  // --- Replication 4 of Property 2: Residential Plot (Begumpet) ---
  {
    ...residentialBase,
    id: '10',
    coordinates: { lat: 17.4357, lng: 78.4616 }, // Begumpet area
    position: { lat: 17.4357, lng: 78.4616 },
    name: 'Central City Residential Plot',
    layer_location: 'Begumpet',
    address: 'Begumpet, Hyderabad, Telangana 500016, India',
    date_added: '28 February 2025',
    ratings: {
      ...residentialBase.ratings,
      whatsGood: [
        ...residentialBase.ratings.whatsGood,
        'Proximity to Metro Station'
      ],
    },
  },
];