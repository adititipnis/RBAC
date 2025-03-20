const mongoose = require('mongoose')
const PageConfig = require('../../src/models/PageConfig')
const Role = require('../../src/models/Role')
const User = require('../../src/models/User')
const Client = require('../../src/models/Client')
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
    hierarchyLevel: 0,
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
    hierarchyLevel: 1,
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
    hierarchyLevel: 2,
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
    hierarchyLevel: 3,
    permissions: [
      { pageType: 'dashboard', allowedActions: ['create', 'read', 'update', 'delete', 'search'] },
    ]
  },
]

const defaultClients = [
  {
    name: 'Acme Corporation',
    code: 'ACME001'
  },
  {
    name: 'TechCorp Solutions',
    code: 'TECH001'
  },
  {
    name: 'Global Industries',
    code: 'GLOB001'
  }
]

async function initDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear collections
    console.log('Clearing database...')
    await Promise.all([
      PageConfig.deleteMany({}),
      Role.deleteMany({}),
      User.deleteMany({}),
      Client.deleteMany({})
    ])
    console.log('Database cleared')

    // Drop all indexes from users collection to clean up any legacy indexes
    try {
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
    const roles = await Promise.all(defaultRoles.map(async (roleData) => {
      try {
        const role = await Role.create(roleData)
        console.log(`Created role: ${role.name}`)
        return role
      } catch (error) {
        console.error(`Error creating role ${roleData.name}:`, error.message)
        throw error
      }
    }))
    console.log('Roles initialized')

    // Initialize clients
    console.log('Initializing clients...')
    const clients = await Client.insertMany(defaultClients)
    console.log('Clients initialized')

    // Create a Client Super Admin for testing
    await User.create({
      name: 'Client Super Admin',
      email: 'clientsuperadmin@test.com',
      password: 'password123',
      role: roles.find(r => r.name === 'Client Super Admin')._id,
      client: clients[0]._id // Assign to Acme Corporation
    })

    // Create a Client Admin for testing
    await User.create({
      name: 'Client Admin',
      email: 'clientadmin@test.com',
      password: 'password123',
      role: roles.find(r => r.name === 'Client Admin')._id,
      client: clients[0]._id // Assign to Acme Corporation
    })

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
  defaultRoles,
  defaultClients
}

// Run both when script is executed directly
if (require.main === module) {
  initDatabase()
} 
