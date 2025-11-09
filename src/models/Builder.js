import mongoose from 'mongoose';

const BuilderSchema = new mongoose.Schema({
  builderName: { type: String, required: true },
  tagline: String,
  foundedYear: String,
  headquarters: String,
  description: String,
  missionStatement: String,
  visionStatement: String,
  directorName: String,
  directorPosition: String,
  directorQuote: String,
  projectsCompleted: Number,
  ongoingProjects: Number,
  upcomingProjects: Number,
  yearsOfExperience: Number,
  citiesPresence: String,
  corporateOfficeAddress: String,
  contactEmail: String,
  phoneNumber: String,
  awards: [{
    title: String,
    organisation: String
  }],
  clientTestimonial: String,
  officialWebsite: String,
  socialMedia: {
    facebook: String,
    linkedin: String,
    instagram: String,
    youtube: String
  },
  builderLogo: {
    fileId: mongoose.Schema.Types.ObjectId,
    filename: String,
    originalName: String,
    contentType: String,
    size: Number,
    uploadDate: Date,
    url: String
  },
  builderCategory: String,
  promotionalVideoUrl: String,
  keyPeople: [{
    photo: {
      uploadDate: Date
    },
    name: String,
    designation: String,
    shortBio: String
  }],
  seo: {
    metaTitle: String,
    urlSlug: String,
    metaDescription: String,
    keywords: String
  },
  createdBy: mongoose.Schema.Types.ObjectId,
  isActive: Boolean,
  status: String,
  galleryImages: [{
    fileId: mongoose.Schema.Types.ObjectId,
    filename: String,
    originalName: String,
    contentType: String,
    size: Number,
    uploadDate: Date,
    url: String,
    _id: mongoose.Schema.Types.ObjectId
  }],
  createdAt: Date,
  updatedAt: Date,
  updatedBy: mongoose.Schema.Types.ObjectId,
  __v: Number
}, {
  collection: 'builders',
  timestamps: true
});

export default mongoose.models.Builder || mongoose.model('Builder', BuilderSchema);
