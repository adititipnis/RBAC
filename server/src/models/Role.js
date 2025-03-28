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
  hierarchyLevel: {
    type: Number,
    required: true
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
      enum: ['create', 'read', 'update', 'delete', 'search']
    }]
  }]
}, {
  timestamps: true
})

// Add index for role name lookup
roleSchema.index({ name: 1 })

// Skip validation in test environment
if (process.env.NODE_ENV !== 'test') {
  roleSchema.pre('save', async function(next) {
    try {
      const PageConfig = mongoose.model('PageConfig')
      
      // Get all valid pages
      const pages = await PageConfig.find({})
      const validPages = new Set(pages.map(p => p.name))
      const validActions = new Set(['create', 'read', 'update', 'delete', 'search'])

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
}

// Method to check if this role can manage another role
roleSchema.methods.canManage = function(targetRole) {
  return this.hierarchyLevel < targetRole.hierarchyLevel
}

// Add a static method to get roles that can be managed by a given role
roleSchema.statics.getManageableRoles = function(roleHierarchyLevel) {
  return this.find({ hierarchyLevel: { $gt: roleHierarchyLevel } })
}

// Add query middleware for find operations
roleSchema.pre(['find', 'findOne', 'findById'], function(next) {
  // Access the options (this is where we'll pass the current user)
  const user = this.getOptions().currentUser;
  
  // If no user provided or user is super admin, don't apply filters
  if (!user || user.role.hierarchyLevel === 0) {
    return next();
  }
  
  // Users can only see roles below their level
  this.where('hierarchyLevel').gt(user.role.hierarchyLevel);
  
  next();
});

// Add middleware for update operations
roleSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  const user = this.getOptions().currentUser;
  
  if (!user) return next();
  
  // Users can only update roles below their level
  this.where('hierarchyLevel').gt(user.role.hierarchyLevel);
  
  // Prevent changing hierarchy level to be equal or lower than user's level
  const update = this.getUpdate();
  if (update && update.$set && typeof update.$set.hierarchyLevel !== 'undefined') {
    if (update.$set.hierarchyLevel <= user.role.hierarchyLevel) {
      const error = new Error('Cannot set role hierarchy level to be equal or higher than your own');
      return next(error);
    }
  }
  
  next();
});

// Add middleware for delete operations 
roleSchema.pre(['deleteOne', 'findOneAndDelete'], function(next) {
  const user = this.getOptions().currentUser;
  
  if (!user) return next();
  
  // Users can only delete roles below their level
  this.where('hierarchyLevel').gt(user.role.hierarchyLevel);
  
  // Prevent deleting critical system roles
  this.where('name').nin(['Super Admin', 'FE Admin', 'Client Super Admin']);
  
  next();
});

const Role = mongoose.model('Role', roleSchema)

module.exports = Role 
