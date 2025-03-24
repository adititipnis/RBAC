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

// Add query middleware for find operations
clientSchema.pre(['find', 'findOne', 'findById'], function(next) {
  const user = this.getOptions().currentUser;
  
  // If no user provided or system-level role, don't apply filters
  if (!user || user.role.hierarchyLevel < 2) {
    return next();
  }
  
  // Client-scoped users can only see their own client
  if (user.client) {
    const clientId = user.client.id || user.client._id || user.client;
    this.where('_id').equals(clientId);
  }
  
  next();
});

// Add middleware for update operations
clientSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  const user = this.getOptions().currentUser;
  
  if (!user) return next();
  
  // Client-scoped users can only update their own client
  if (user.role.hierarchyLevel >= 2 && user.client) {
    const clientId = user.client.id || user.client._id || user.client;
    this.where('_id').equals(clientId);
    
    // Prevent updating critical fields
    const update = this.getUpdate();
    if (update && update.$set) {
      delete update.$set.code; // Client users can't update client codes
    }
  }
  
  next();
});

// Add middleware for delete operations
clientSchema.pre(['deleteOne', 'findOneAndDelete'], function(next) {
  const user = this.getOptions().currentUser;
  
  // Client-scoped users cannot delete clients
  if (user && user.role.hierarchyLevel >= 2) {
    const error = new Error('Client-scoped users cannot delete clients');
    return next(error);
  }
  
  next();
});

const Client = mongoose.model('Client', clientSchema)

module.exports = Client 
