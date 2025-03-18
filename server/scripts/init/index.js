const mongoose = require('mongoose')
const PageConfig = require('../../src/models/PageConfig')
const Role = require('../../src/models/Role')
require('dotenv').config()

// Default pages configuration
const defaultPages = [
  { name: 'userManagement' },
  { name: 'roleManagement' },
  { name: 'permissionManagement' },
  { name: 'clientManagement' },
  { name: 'diagnostic' },
  { name: 'dashboard' },
  { name: 'report' }
]

// Default roles configuration
const defaultRoles = [
  {
    name: 'Super Admin',
    permissions: [
      { pageType: 'userManagement', allowedActions: ['create', 'read', 'update', 'delete', 'search'] },
      { pageType: 'roleManagement', allowedActions: ['create', 'read', 'update', 'delete', 'search'] },
      { pageType: 'permissionManagement', allowedActions: ['create', 'read', 'update', 'delete', 'search'] },
      { pageType: 'clientManagement', allowedActions: ['create', 'read', 'update', 'delete', 'search'] },
      { pageType: 'diagnostic', allowedActions: ['create', 'read', 'update', 'delete', 'search'] },
      { pageType: 'dashboard', allowedActions: ['create', 'read', 'update', 'delete', 'search'] },
      { pageType: 'report', allowedActions: ['create', 'read', 'update', 'delete', 'search'] }
    ]
  },
  {
    name: 'FE Admin',
    permissions: [
      { pageType: 'userManagement', allowedActions: ['create', 'read', 'update', 'delete', 'search'] },
      { pageType: 'clientManagement', allowedActions: ['create', 'read', 'update', 'delete', 'search'] },
      { pageType: 'diagnostic', allowedActions: ['create', 'read', 'update', 'delete', 'search'] },
      { pageType: 'dashboard', allowedActions: ['create', 'read', 'update', 'delete', 'search'] },
      { pageType: 'report', allowedActions: ['create', 'read', 'update', 'delete', 'search'] }
    ]
  },
  {
    name: 'Client Super Admin',
    permissions: [
      { pageType: 'userManagement', allowedActions: ['create', 'read', 'update', 'delete', 'search'] },
      { pageType: 'roleManagement', allowedActions: ['create', 'read', 'update', 'delete', 'search'] },
      { pageType: 'permissionManagement', allowedActions: ['create', 'read', 'update', 'delete', 'search'] },
      { pageType: 'diagnostic', allowedActions: ['read', 'search'] },
      { pageType: 'dashboard', allowedActions: ['read', 'search'] },
      { pageType: 'report', allowedActions: ['read', 'search'] }
    ]
  },
  {
    name: 'Client Admin',
    permissions: [
      { pageType: 'dashboard', allowedActions: ['create', 'read', 'update', 'delete', 'search'] },
    ]
  },
]

async function initDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear collections
    console.log('Clearing database...')
    await Promise.all([
      PageConfig.deleteMany({}),
      Role.deleteMany({})
    ])
    console.log('Database cleared')

    // Drop all indexes from users collection to clean up any legacy indexes
    try {
      const User = require('../../src/models/User')
      await User.collection.dropIndexes()
    } catch (error) {
      // Ignore error if collection doesn't exist
      if (error.code !== 26) throw error
    }

    // Initialize pages
    console.log('Initializing pages...')
    await PageConfig.insertMany(defaultPages)
    console.log('Pages initialized')

    // Initialize roles one by one to handle errors better
    console.log('Initializing roles...')
    for (const roleData of defaultRoles) {
      try {
        await Role.create(roleData)
        console.log(`Created role: ${roleData.name}`)
      } catch (error) {
        console.error(`Error creating role ${roleData.name}:`, error.message)
        throw error
      }
    }
    console.log('Roles initialized')

    await mongoose.disconnect()
    console.log('Database initialization completed successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  }
}

// Allow running separately if needed
module.exports = {
  initDatabase,
  defaultPages,
  defaultRoles
}

// Run both when script is executed directly
if (require.main === module) {
  initDatabase()
} 
