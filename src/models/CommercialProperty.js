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

const FacilitySchema = new mongoose.Schema({
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
}, { _id: true });

const OpeningHoursSchema = new mongoose.Schema({
  mondayFriday: {
    enabled: Boolean,
    open: String,
    close: String,
  },
  saturday: {
    enabled: Boolean,
    open: String,
    close: String,
  },
  sunday: {
    enabled: Boolean,
    open: String,
    close: String,
  },
}, { _id: false });

const CommercialPropertySchema = new mongoose.Schema({
  // Core Info
  name: String,
  propertyName: String,
  propertyType: {
    type: String,
    enum: ['commercial', 'techpark', 'office', 'retail', 'warehouse'],
    default: 'commercial'
  },
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
  furnishing: String,
  brandLogo: String,
  carpetArea: String,

  // Stats & Features
  isUnderManagement: String,
  selectedFloors: [String],
  facilities: [FacilitySchema],
  amenities: [AmenitySchema],
  seatLayoutOptions: [String],
  openingHours: OpeningHoursSchema,
  floorConfigurations: [FloorConfigurationSchema],
  washrooms: Number,
  propertyAge: String,
  facing: String,
  parking: String,

  // Pricing
  originalPrice: String,
  discountedPrice: String,
  additionalPrice: String,
  totalPrice: String,
  pricePerDesk: Number,
  pricePerSqft: Number,

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
  furnishingStatus: String,

  // Address & Location
  address: {
    country: String,
    flat: String,
    street: String,
    city: String,
    locality: String,
    state: String,
    pincode: String,
  },
  location: String,
  stateName: String,
  cityName: String,
  layerLocation: String,
  locationDistrict: String,

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
  seatLayoutImages: [FileSchema],
  seatLayoutPDFs: [FileSchema],
  propertyVideos: [FileSchema],

  // Floor Plans
  floorPlans: {
    type: Map,
    of: [String],
  },

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
  createdBy: mongoose.Schema.Types.ObjectId,
  updatedBy: mongoose.Schema.Types.ObjectId,
  dateAdded: String,
  uploadedDate: String,
  publishedAt: Date,
  noOfSeats: Number,
}, {
  timestamps: true,
  strict: false,
  collection: 'commercialProperties',
});

export default mongoose.models.CommercialProperty || mongoose.model('CommercialProperty', CommercialPropertySchema);
