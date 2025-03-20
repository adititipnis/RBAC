const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: 'Invalid email format'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    // Only required for Client Super Admin and Client Admin roles
    required: function() {
      return this.role && ['Client Super Admin', 'Client Admin'].includes(this.role.name)
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  lastPasswordChange: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Add index for email lookup
userSchema.index({ email: 1 })

// Add compound index for clientId and email
userSchema.index({ client: 1, email: 1 }, { unique: true })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}

module.exports = mongoose.model('User', userSchema) 
