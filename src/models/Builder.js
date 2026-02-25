import mongoose from 'mongoose';

const BuilderSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true },
    builderName: { type: String },
    tagline: String,
    founded: String,
    foundedYear: String,
    headquarters: String,
    description: String,
    shortDescription: String,
    detailedDescription: String,
    keyDifferentiators: [String],

    // Stats
    stats: {
      projects: { type: String, default: '0' },
      cities: String,
      sqft: String,
      clients: String,
      experience: String,
      experienceNum: Number,
      projectsNum: Number,
    },
    projectsCompleted: Number,
    ongoingProjects: Number,
    upcomingProjects: Number,
    yearsOfExperience: Number,
    citiesPresence: String,
    ongoingCount: Number,
    upcomingCount: Number,
    totalCenters: String,

    // Identity
    logo: String,
    isBrigade: { type: Boolean, default: false },
    builderLogo: {
      fileId: mongoose.Schema.Types.ObjectId,
      filename: String,
      originalName: String,
      contentType: String,
      size: Number,
      uploadDate: Date,
      url: String,
    },
    category: String,
    builderCategory: String,
    licenseNumber: String,
    certificate: String,

    // Mission & Vision
    mission: String,
    vision: String,
    missionStatement: String,
    visionStatement: String,

    // Contact Info
    phone: String,
    phoneNumber: String,
    email: String,
    contactEmail: String,
    corporateOfficeAddress: String,
    officialWebsite: String,

    // Specialties & Regions
    specialties: [String],
    operatingRegions: [String],
    moreDetails: [
      {
        label: String,
        value: String,
      },
    ],
    operationalSegments: [
      {
        name: String,
        cities: [String],
      },
    ],

    // Projects
    projects: [
      {
        name: String,
        location: String,
        area: String,
        status: String,
        type: { type: String, enum: ['newLaunch', 'upcoming', 'readyToMove'] },
        price: Number,
        seats: Number,
      },
    ],
    featuredProject: {
      name: String,
      location: String,
      image: String,
      units: String,
      size: String,
      launchDate: String,
      possession: String,
      plotSize: String,
      configurations: [String],
      priceRange: String,
      dealsClosed: Number,
      inProgress: Number,
    },
    keyProjects: [
      {
        name: String,
        location: String,
        image: String,
        href: String,
      },
    ],

    // People
    relationshipManager: {
      name: String,
      title: String,
      tag: String,
      avatar: String,
      assisted: String,
      companyLogos: [String],
    },
    team: [
      {
        name: String,
        role: String,
        image: String,
        quote: String,
        bio: String,
      },
    ],
    keyPeople: [
      {
        name: String,
        designation: String,
        shortBio: String,
        photo: { uploadDate: Date, url: String },
      },
    ],
    directorName: String,
    directorPosition: String,
    directorQuote: String,

    // Social & Recognition
    awards: [
      {
        title: String,
        organisation: String,
        image: String,
      },
    ],
    clientTestimonial: String,
    testimonials: [
      {
        quote: String,
        author: String,
        avatar: String,
      },
    ],
    faqs: [
      {
        q: String,
        a: String,
      },
    ],
    socialLinks: {
      facebook: String,
      twitter: String,
      linkedin: String,
      instagram: String,
      youtube: String,
    },
    socialMedia: {
      facebook: String,
      linkedin: String,
      instagram: String,
      youtube: String,
    },

    // Media
    galleryImages: [
      {
        fileId: mongoose.Schema.Types.ObjectId,
        filename: String,
        originalName: String,
        contentType: String,
        size: Number,
        uploadDate: Date,
        url: String,
        alt: String,
        _id: mongoose.Schema.Types.ObjectId,
      },
    ],
    promotionalVideoUrl: String,
    brochureUrl: String,

    // SEO
    seo: {
      metaTitle: String,
      urlSlug: String,
      metaDescription: String,
      keywords: String,
    },

    // Meta
    createdBy: mongoose.Schema.Types.ObjectId,
    updatedBy: mongoose.Schema.Types.ObjectId,
    isActive: { type: Boolean, default: true },
    status: String,
  },
  {
    collection: 'builders',
    timestamps: true,
  }
);

export default mongoose.models.Builder || mongoose.model('Builder', BuilderSchema);
