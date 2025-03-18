const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
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
userSchema.index({ clientId: 1, email: 1 }, { unique: true })

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
