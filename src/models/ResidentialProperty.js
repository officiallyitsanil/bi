import mongoose from 'mongoose';

const AmenitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
}, { _id: false });

const NearbyPlaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  distance: {
    type: String,
    required: true,
  },
}, { _id: false });

const ReviewSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  date: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
}, { _id: false });

const ResidentialPropertySchema = new mongoose.Schema({
  propertyType: {
    type: String,
    required: true,
    enum: ['commercial', 'residential'],
    default: 'residential',
  },
  state_name: {
    type: String,
    required: true,
  },
  coordinates: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  position: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  name: {
    type: String,
    required: true,
  },
  originalPrice: {
    type: String,
    required: true,
  },
  discountedPrice: {
    type: String,
    required: true,
  },
  additionalPrice: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  featuredImageUrl: {
    type: String,
    required: true,
  },
  date_added: {
    type: String,
    required: true,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  sellerPhoneNumber: {
    type: String,
    required: true,
  },
  layer_location: {
    type: String,
    required: true,
  },
  location_district: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  amenities: {
    type: [AmenitySchema],
    default: [],
  },
  nearbyPlaces: {
    school: {
      type: [NearbyPlaceSchema],
      default: [],
    },
    hospital: {
      type: [NearbyPlaceSchema],
      default: [],
    },
    hotel: {
      type: [NearbyPlaceSchema],
      default: [],
    },
    business: {
      type: [NearbyPlaceSchema],
      default: [],
    },
  },
  floorPlans: {
    type: Map,
    of: [String],
    default: {},
  },
  ratings: {
    overall: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      required: true,
      default: 0,
    },
    breakdown: {
      type: Map,
      of: Number,
      default: {},
    },
    whatsGood: {
      type: [String],
      default: [],
    },
    whatsBad: {
      type: [String],
      default: [],
    },
  },
  reviews: {
    type: [ReviewSchema],
    default: [],
  },
}, {
  timestamps: true,
});

export default mongoose.models.ResidentialProperty || mongoose.model('ResidentialProperty', ResidentialPropertySchema);
