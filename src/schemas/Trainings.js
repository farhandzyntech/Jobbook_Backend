const mongoose = require('mongoose')
const { Schema } = mongoose

// Define the Course schema
const trainingSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  content: [{
    title: String,
    videoUrl: String,
    textContent: String,
    resources: [String] // URLs or references to resources
  }],
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reviews: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewText: String,
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now }
  }],
  price: {
    type: Number,
    required: true
  }, 
  language: {
    type: String,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  }
},{ timestamps: true })

// Create a model from the schema
module.exports = mongoose.model('Training', trainingSchema);