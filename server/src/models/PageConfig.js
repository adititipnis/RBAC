const mongoose = require('mongoose')
const { Schema } = mongoose

const pageConfigSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
})

// Add index for name lookup
pageConfigSchema.index({ name: 1 })

const PageConfig = mongoose.model('PageConfig', pageConfigSchema)

module.exports = PageConfig 
