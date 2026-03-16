import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  country: String,
  flat: String,
  street: String,
  city: String,
  locality: String,
  state: String,
  pincode: String,
  district: String
}, { _id: false });

const CoordinatesSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number
}, { _id: false });

const AgentDetailsSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  whatsapp: String,
  tag: String,
  image: String,
  tagline: String,
  assistedCorporates: [String]
}, { _id: false });

const BrandDetailsSchema = new mongoose.Schema({
  name: String,
  logo: String,
  description: String,
  cities: Number,
  clients: Number,
  spaces: Number,
  seats: Number
}, { _id: false });

const OpeningHoursSchema = new mongoose.Schema({
  mondayFriday: String,
  saturday: String,
  sunday: String
}, { _id: false });

const NearbyPlaceSchema = new mongoose.Schema({
  name: String,
  distance: String
}, { _id: false });

const NearbyPlacesSchema = new mongoose.Schema({
  schools: [NearbyPlaceSchema],
  busStops: [NearbyPlaceSchema],
  hospitals: [NearbyPlaceSchema],
  banks: [NearbyPlaceSchema],
  temples: [NearbyPlaceSchema],
  atms: [NearbyPlaceSchema],
  malls: [NearbyPlaceSchema]
}, { _id: false });

const RatingBreakdownSchema = new mongoose.Schema({
  "1": Number,
  "2": Number,
  "3": Number,
  "4": Number,
  "5": Number
}, { _id: false });

const RatingsSchema = new mongoose.Schema({
  overall: Number,
  totalRatings: Number,
  tag: String,
  breakdown: RatingBreakdownSchema
}, { _id: false });

const ReviewSchema = new mongoose.Schema({
  user: String,
  userPhoneNumber: String,
  rating: Number,
  date: String,
  goodThings: String,
  badThings: String
}, { _id: false });

const CustomInfrastructureSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.Mixed },
  name: String
}, { _id: false });

const AmenitySchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.Mixed },
  name: String,
  category: String
}, { _id: false });

const PropertyVideoSchema = new mongoose.Schema({
  url: String,
  thumbnail: String,
  fileId: String,
  filename: String
}, { _id: false });

const SimilarPropertySchema = new mongoose.Schema({
  id: String,
  name: String,
  locality: String,
  price: String,
  rating: Number,
  badge: String,
  image: String
}, { _id: false });

const ExploreLocationSchema = new mongoose.Schema({
  name: String,
  image: String
}, { _id: false });

const SeatLayoutPDFSchema = new mongoose.Schema({
  url: String,
  originalName: String,
  filename: String,
  size: Number,
  fileId: String
}, { _id: false });

const ResidentialPropertySchema = new mongoose.Schema({
  propertyCategory: String,
  category: String,
  propertyName: String,
  address: AddressSchema,
  displayAddress: String,
  coordinates: CoordinatesSchema,
  verificationStatus: String,
  isTopRated: Boolean,
  isPremium: Boolean,
  listingType: String,
  totalPrice: String,
  discountPercent: Number,
  isNegotiablePrice: Boolean,
  pricePerSeat: String,
  pricePerSqft: String,
  numberOfSeats: String,
  furnishingLevel: String,
  buildingLease: String,
  minInventoryUnit: String,
  maxInventoryUnit: String,
  propertySize: Number,
  singleFloorCapacity: String,
  underManagement: String,
  availableFloors: String,
  officeSpaceSolutions: String,
  builderName: String,
  facilities: { type: mongoose.Schema.Types.Mixed },
  agentDetails: AgentDetailsSchema,
  brandDetails: BrandDetailsSchema,
  floorPlan: String,
  openingHours: OpeningHoursSchema,
  visitorCount: Number,
  nearbyPlaces: NearbyPlacesSchema,
  ratings: RatingsSchema,
  reviews: [ReviewSchema],
  offerTag: String,
  customInfrastructure: [CustomInfrastructureSchema],
  amenities: [AmenitySchema],
  images: [String],
  pdf: String,
  video: String,
  propertyVideos: [PropertyVideoSchema],
  seatLayoutPDFs: [SeatLayoutPDFSchema],
  selectedFloors: [String],
  propertyType: String,
  propertyLabel: String,

  // Residential specific
  furnishingStatus: String,
  society: String,
  locality: String,
  bedroom: String,
  saleType: String,
  constructionStatus: String,
  washrooms: Number,
  facing: String,
  isRera: Boolean,
  hasOffers: Boolean,

  postedBy: String,
  uploadedDate: String,
  similarLocations: [String],
  allSimilarLocations: [String],
  similarProperties: [SimilarPropertySchema],
  exploreLocations: [ExploreLocationSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'residentialproperties',
  timestamps: true
});

export default mongoose.models.ResidentialProperty || mongoose.model('ResidentialProperty', ResidentialPropertySchema);
