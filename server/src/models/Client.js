const mongoose = require('mongoose')
const { Schema } = mongoose

const clientSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',  // References the User model
    required: true,
    validate: {
      // Ensure the createdBy user has Super Admin role
      validator: async function(userId) {
        const User = mongoose.model('User')
        const user = await User.findById(userId).populate('roles')
        return user && user.role.some(role => role.name === 'FE Admin')
      },
      message: 'Client can only be created by a Super Admin'
    }
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt fields
})

// Add index for name lookup
clientSchema.index({ name: 1 })

// Add index for createdBy lookup
clientSchema.index({ createdBy: 1 })

const Client = mongoose.model('Client', clientSchema)

module.exports = Client 
