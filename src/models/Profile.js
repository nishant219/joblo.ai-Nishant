import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    headline: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      index: true
    },
    locationDetails: {
      country: String,
      state: String,
      city: String,
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: [Number]
      }
    },
    currentPosition: {
      title: String,
      company: String,
      startDate: Date,
      industry: String
    },
    skills: [{
      name: { type: String, index: true },
      endorsements: Number,
      lastUsed: Date
    }],
    experience: [{
      title: String,
      company: String,
      location: String,
      startDate: Date,
      endDate: Date,
      description: String,
      skills: [String],
      highlights: [String]
    }],
    education: [{
      institution: String,
      degree: String,
      field: String,
      startYear: Number,
      endYear: Number
    }],
    certifications: [{
      name: String,
      issuer: String,
      issueDate: Date,
      expiryDate: Date
    }],
    languages: [{
      name: String,
      proficiency: String
    }],
    sourceUrl: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    sourceId: {
      type: String,
      unique: true,
      sparse: true
    },
    crawlStatus: {
      lastCrawled: Date,
      isActive: { type: Boolean, default: true },
      errorLog: [{
        date: Date,
        message: String
      }]
    },
    profileScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }, {
    timestamps: true
  });
  
  // Compound indexes for profile matching
  profileSchema.index({ 'locationDetails.city': 1, 'skills.name': 1 });
  profileSchema.index({ 'currentPosition.title': 1, 'currentPosition.company': 1 });
  profileSchema.index({ 'locationDetails.coordinates': '2dsphere' });
  
  // Full-text search index
  profileSchema.index({
    headline: 'text',
    'skills.name': 'text',
    'experience.description': 'text'
  }, {
    weights: {
      headline: 10,
      'skills.name': 5,
      'experience.description': 1
    }
  });

module.exports = mongoose.model('Profile', profileSchema);