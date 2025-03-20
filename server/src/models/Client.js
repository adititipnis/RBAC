const mongoose = require('mongoose')
const { Schema } = mongoose

const clientSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt fields
})

// Add index for name lookup
clientSchema.index({ name: 1 })

const Client = mongoose.model('Client', clientSchema)

module.exports = Client 
