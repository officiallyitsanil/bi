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
  propertyType: {
    type: String,
    enum: ['commercial', 'techpark', 'office', 'retail', 'warehouse'],
  },
  isUnderManagement: String,
  selectedFloors: [String],
  facilities: [FacilitySchema],
  propertyName: String,
  category: String,
  Category: String,
  address: {
    country: String,
    flat: String,
    street: String,
    city: String,
    locality: String,
    state: String,
    pincode: String,
  },
  coordinates: {
    latitude: Number,
    longitude: Number,
    lat: Number,
    lng: Number,
  },
  openingHours: OpeningHoursSchema,
  floorConfigurations: [FloorConfigurationSchema],
  amenities: [AmenitySchema],
  seatLayoutOptions: [String],
  originalPrice: String,
  discountedPrice: String,
  additionalPrice: String,
  badge: String,
  date_added: String,
  verificationStatus: String,
  nearbyPlaces: {
    school: [NearbyPlaceSchema],
    hospital: [NearbyPlaceSchema],
    hotel: [NearbyPlaceSchema],
    business: [NearbyPlaceSchema],
  },
  ratings: {
    overall: Number,
    totalRatings: Number,
    breakdown: Object,
    whatsGood: [String],
    whatsBad: [String],
  },
  reviews: [ReviewSchema],
  status: String,
  createdBy: mongoose.Schema.Types.ObjectId,
  views: Number,
  inquiries: Number,
  location: String,
  sellerPhoneNumber: String,
  interiorImages: [FileSchema],
  seatLayoutImages: [FileSchema],
  seatLayoutPDFs: [FileSchema],
  propertyVideos: [FileSchema],
  featuredImage: FileSchema,
  publishedAt: Date,
  updatedBy: mongoose.Schema.Types.ObjectId,
  
  // Legacy fields for backward compatibility
  state_name: String,
  city: String,
  name: String,
  images: [String],
  featuredImageUrl: String,
  is_verified: Boolean,
  layer_location: String,
  location_district: String,
  floorPlans: {
    type: Map,
    of: [String],
  },
  price_per_desk: Number,
  price_per_sqft: Number,
  no_of_seats: Number,
}, {
  timestamps: true,
  strict: false,
  collection: 'commercialProperties',
});

export default mongoose.models.CommercialProperty || mongoose.model('CommercialProperty', CommercialPropertySchema);
