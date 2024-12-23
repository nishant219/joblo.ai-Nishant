import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    index: true,
    trim: true
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
  description: {
    type: String,
    required: true
  },
  employmentType: {
    type: String,
    enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERNSHIP'],
    index: true
  },
  experienceLevel: {
    type: String,
    enum: ['ENTRY', 'ASSOCIATE', 'MID_SENIOR', 'DIRECTOR', 'EXECUTIVE'],
    index: true
  },
  skills: [{
    name: { type: String, index: true },
    required: { type: Boolean, default: true }
  }],
  requirements: [{
    type: { type: String, enum: ['EDUCATION', 'EXPERIENCE', 'CERTIFICATION', 'OTHER'] },
    description: String
  }],
  salary: {
    min: Number,
    max: Number,
    currency: String,
    period: { type: String, enum: ['HOURLY', 'MONTHLY', 'YEARLY'] }
  },
  // Crawling metadata
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
  postDate: Date,
  expiryDate: Date,
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'FILLED', 'REMOVED'],
    default: 'ACTIVE',
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
jobSchema.index({ 'locationDetails.city': 1, 'skills.name': 1 });
jobSchema.index({ company: 1, status: 1 });
jobSchema.index({ 'locationDetails.coordinates': '2dsphere' });

// Full-text search index
jobSchema.index({
  title: 'text',
  description: 'text',
  'skills.name': 'text'
}, {
  weights: {
    title: 10,
    'skills.name': 5,
    description: 1
  }
});

const Job = mongoose.model('Job', jobSchema);
export default Job;

