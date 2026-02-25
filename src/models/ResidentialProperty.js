import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  fileId: mongoose.Schema.Types.ObjectId,
  filename: String,
  originalName: String,
  contentType: String,
  size: Number,
  uploadDate: Date,
  url: String,
  description: String,
  tags: [String],
}, { _id: false });

const AmenitySchema = new mongoose.Schema({
  name: String,
  image: String,
}, { _id: true });

const NearbyPlaceSchema = new mongoose.Schema({
  name: String,
  location: String,
  distance: String,
}, { _id: true });

const ReviewSchema = new mongoose.Schema({
  user: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  date: String,
  comment: String,
  goodThings: String,
  badThings: String,
  userPhoneNumber: String,
}, { _id: true });

const FloorConfigurationSchema = new mongoose.Schema({
  floor: String,
  dedicatedCabin: {
    enabled: Boolean,
    readyToMove: Boolean,
    readyForFitOut: Boolean,
    availableFrom: Date,
    timeline: String,
    seats: String,
    pricePerSeat: String,
    pricePerSqft: String,
    billableUnits: String,
  },
  dedicatedFloor: {
    enabled: Boolean,
    readyToMove: Boolean,
    readyForFitOut: Boolean,
    availableFrom: Date,
    timeline: String,
    seats: String,
    pricePerSeat: String,
    pricePerSqft: String,
    billableUnits: String,
  },
}, { _id: false });

const ResidentialPropertySchema = new mongoose.Schema({
  // Core Info
  name: String,
  propertyName: String,
  propertyType: { type: String, default: 'residential' },
  listingType: String,
  propertyCategoryType: String,
  category: String,

  // UI rendering specifics
  underManagement: Boolean,
  availableFloors: String,
  officeSpaceSolutions: String,
  builderName: String,
  agentName: String,
  agentPhone: String,
  agentImage: String,
  brandLogo: String,

  // Types & Sizes
  selectedType: String,
  apartmentType: String,
  bhkType: String,
  propertySize: String,
  carpetArea: String,
  size: String,

  // Floor Info
  floor: String,
  totalFloors: String,
  selectedFloors: [String],
  floors_available: [String],

  // Features
  facing: String,
  propertyAge: String,
  availableFor: String,
  furnishing: String,
  parking: String,
  bathrooms: Number,
  washrooms: Number,
  balconies: Number,

  // Pricing
  expectedRent: String,
  expectedDeposit: String,
  monthlyMaintenance: String,
  isNegotiable: Boolean,
  originalPrice: String,
  discountedPrice: String,
  additionalPrice: String,
  totalPrice: String,
  pricePerAcre: Number,
  pricePerSqft: Number,
  pricePerDesk: Number,

  // Status & Verification
  status: String,
  verificationStatus: { type: String, default: 'pending' },
  isVerified: { type: Boolean, default: false },
  badge: String,
  isTopRated: Boolean,
  reraRegistered: Boolean,
  saleType: String,
  constructionStatus: String,
  possessionStatus: String,
  listedBy: String,
  postedBy: String,
  propertiesWithOffers: Boolean,

  // Availability
  availableFrom: String,
  whoWillShow: String,
  currentSituation: String,
  waterSupply: String,

  // Rules & Facilities
  nonVegAllowed: Boolean,
  gatedSecurity: Boolean,
  gym: Boolean,
  amenities: [AmenitySchema],
  facilities: [String],

  // Address & Location
  address: {
    country: String,
    state: String,
    district: String,
    city: String,
    locality: String,
    street: String,
    pincode: String,
    landmark: String,
  },
  location: String,
  stateName: String,
  cityName: String,
  layerLocation: String,
  locationDistrict: String,
  directionsTip: String,

  // Coordinates
  coordinates: {
    latitude: Number,
    longitude: Number,
    lat: Number,
    lng: Number,
  },
  position: {
    lat: Number,
    lng: Number,
  },

  // Media
  images: [String],
  featuredImageUrl: String,
  featuredImage: FileSchema,
  interiorImages: [FileSchema],
  propertyVideos: [FileSchema],

  // Floor Plans
  floorPlans: {
    type: Map,
    of: [String],
  },
  floorConfigurations: [FloorConfigurationSchema],

  // Brand Info (from UI)
  brandName: String,
  brandStats: {
    cities: String,
    clients: String,
    spaces: String,
    seats: String,
  },
  brandDescription: String,

  // Nearby & Social
  nearbyPlaces: {
    school: [NearbyPlaceSchema],
    hospital: [NearbyPlaceSchema],
    hotel: [NearbyPlaceSchema],
    business: [NearbyPlaceSchema],
  },

  // Engagement
  views: { type: Number, default: 0 },
  visitorCount: { type: Number, default: 0 },
  inquiries: { type: Number, default: 0 },
  ratings: {
    overall: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    breakdown: Object,
    whatsGood: [String],
    whatsBad: [String],
  },
  reviews: [ReviewSchema],

  // Meta
  sellerPhoneNumber: String,
  isUnderManagement: String,
  createdBy: mongoose.Schema.Types.ObjectId,
  updatedBy: mongoose.Schema.Types.ObjectId,
  dateAdded: String,
  uploadedDate: String,
  publishedAt: Date,
  noOfSeats: Number,
}, {
  timestamps: true,
  strict: false,
  collection: 'residentialproperties',
});

export default mongoose.models.ResidentialProperty || mongoose.model('ResidentialProperty', ResidentialPropertySchema);
