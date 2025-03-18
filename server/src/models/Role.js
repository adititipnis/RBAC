const mongoose = require('mongoose')
const { Schema } = mongoose

// Define the permission schema as a sub-document
const permissionSchema = new Schema({
  pageType: {
    type: String,
    required: true,
    trim: true
  },
  allowedActions: [{
    type: String,
    required: true,
    trim: true
  }]
}, {
  _id: false
})

const roleSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        // Allow Super Admin and other standard roles
        const validRoles = ['Super Admin', 'FE Admin', 'Client Super Admin', 'Client Admin']
        return validRoles.includes(v)
      },
      message: props => `${props.value} is not a valid role name`
    }
  },
  description: {
    type: String
  },
  permissions: [{
    pageType: {
      type: String,
      required: true
    },
    allowedActions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete']
    }]
  }]
}, {
  timestamps: true
})

// Add index for role name lookup
roleSchema.index({ name: 1 })

// Add validation to check if pageType and actions exist in PageConfig
roleSchema.pre('save', async function(next) {
  try {
    const PageConfig = mongoose.model('PageConfig')
    
    // Get all valid pages
    const pages = await PageConfig.find({})
    const validPages = new Set(pages.map(p => p.name))
    const validActions = new Set(['create', 'read', 'update', 'delete'])

    // Validate each permission
    for (const perm of this.permissions) {
      if (!validPages.has(perm.pageType)) {
        throw new Error(`Invalid pageType: ${perm.pageType}`)
      }

      for (const action of perm.allowedActions) {
        if (!validActions.has(action)) {
          throw new Error(`Invalid action "${action}" for page "${perm.pageType}"`)
        }
      }
    }

    // Prevent modification of Super Admin role
    if (this.isModified() && this.name === 'Super Admin' && !this.isNew) {
      const error = new Error('Super Admin role cannot be modified')
      return next(error)
    }

    next()
  } catch (error) {
    next(error)
  }
})

const Role = mongoose.model('Role', roleSchema)

module.exports = Role 
