import mongoose from 'mongoose';

const NewBuildersSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    tagline: String,
    headquarters: String,
    yearOfEstablishment: Number,
    projectsCompleted: Number,
    ongoingProjects: Number,
    upcomingProjects: Number,
    totalYearsExperience: Number,
    logo: String,
    builderCategory: String,
    citiesOfOperation: String,
    totalCenters: Number,
    totalBuiltupArea: Number,
    totalClientsServed: Number,
    licenseNumber: String,
    certificate: String,

    shortDescription: String,
    detailedDescription: String,
    missionStatement: String,
    visionStatement: String,
    keyDifferentiators: String,
    largestCampusDetails: String,
    flagshipLocations: String,
    minimumLockinPeriod: String,
    expansionFlexibility: { type: Boolean, default: true },

    officialWebsite: String,
    facebookUrl: String,
    linkedinUrl: String,
    instagramUrl: String,
    youtubeUrl: String,

    centerName: String,
    micromarket: String,
    city: String,
    fullAddress: String,
    mapLink: String,
    contactEmail: String,
    phoneNumber: String,
    centerImages: [String],
    promotionalVideoUrl: String,

    specialties: [String],


    listingCategory: { type: String, enum: ['newLaunch', 'upcoming', 'readyToMove'] },

    directorName: String,
    directorPosition: String,
    directorQuote: String,

    keyPeople: [
      {
        photo: String,
        name: String,
        designation: String,
        shortBio: String,
      },
    ],

    relationshipManager: {
      name: String,
      designation: String,
      photo: String,
      contactNumber: String,
      whatsappNumber: String,
      email: String,
    },

    awards: [
      {
        image: String,
        title: String,
        organisation: String,
      },
    ],

    testimonials: [
      {
        clientPhoto: String,
        clientName: String,
        testimonial: String,
      },
    ],

    faqs: [
      {
        question: String,
        answer: String,
      },
    ],

    seo: {
      metaTitle: String,
      urlSlug: String,
      metaDescription: String,
      keywords: String,
    },

    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  },
  {
    collection: 'newbuilders',
    timestamps: true,
  }
);

export default mongoose.models.NewBuilders || mongoose.model('NewBuilders', NewBuildersSchema);
