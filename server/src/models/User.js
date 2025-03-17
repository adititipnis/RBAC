const mongoose = require('mongoose')
const { Schema } = mongoose
const bcrypt = require('bcryptjs')
const validator = require('validator')

const userSchema = new Schema({
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
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    validate: {
      validator: async function() {
        if (!this.role) return true;

        try {
          const Role = mongoose.model('Role');
          const userRole = await Role.findById(this.role).exec();
          
          if (!userRole) {
            throw new Error('Role not found');
          }

          const roleName = userRole.name;
          const needsClient = roleName === 'Client Super Admin' || roleName === 'Client Admin';

          return !needsClient || (this.clientId != null);
        } catch (error) {
          return false;
        }
      },
      message: 'Client ID is required for Client Super Admin and Client Admin roles'
    }
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  lastPasswordChange: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt fields
})

// Add index for email lookup
userSchema.index({ email: 1 })

// Add compound index for clientId and email
userSchema.index({ clientId: 1, email: 1 }, { unique: true })

// Hash password before saving
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

// Method to verify password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}

const User = mongoose.model('User', userSchema)

module.exports = User 
