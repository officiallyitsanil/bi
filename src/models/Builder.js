import mongoose from 'mongoose';

const BuilderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    builderName: { type: String },
    tagline: String,
    founded: String,
    foundedYear: String,
    headquarters: String,
    description: String,

    stats: {
      projects: { type: String, default: '0' },
      cities: String,
      sqft: String,
      clients: String,
      experience: String,
      experienceNum: Number,
      projectsNum: Number,
    },

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

    mission: String,
    vision: String,
    missionStatement: String,
    visionStatement: String,


    phone: String,
    email: String,
    phoneNumber: String,
    contactEmail: String,
    corporateOfficeAddress: String,
    officialWebsite: String,
    licenseNumber: String,
    certificate: String,
    category: String,
    builderCategory: String,
    totalCenters: String,

    specialties: [String],
    operatingRegions: [String],
    moreDetails: [
      {
        label: String,
        value: String,
      },
    ],

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

    ongoingCount: Number,
    upcomingCount: Number,
    projectsCompleted: Number,
    ongoingProjects: Number,
    upcomingProjects: Number,
    yearsOfExperience: Number,
    citiesPresence: String,

    relationshipManager: {
      name: String,
      title: String,
      tag: String,
      avatar: String,
      assisted: String,
      companyLogos: [String],
    },

    directorName: String,
    directorPosition: String,
    directorQuote: String,

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

    shortDescription: String,
    detailedDescription: String,
    keyDifferentiators: [String],

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

    operationalSegments: [
      {
        name: String,
        cities: [String],
      },
    ],

    promotionalVideoUrl: String,
    brochureUrl: String,
    seo: {
      metaTitle: String,
      urlSlug: String,
      metaDescription: String,
      keywords: String,
    },

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
