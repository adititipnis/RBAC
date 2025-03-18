const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
require('dotenv').config({ path: '.env.test' })

let mongod

beforeAll(async () => {
  // Create new in-memory database for testing
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  
  // Connect to the in-memory database
  await mongoose.connect(uri)
})

afterAll(async () => {
  // Clean up
  await mongoose.disconnect()
  await mongod.stop()
})

afterEach(async () => {
  // Clear all collections after each test
  if (mongoose.connection.readyState === 1) {
    const collections = await mongoose.connection.db.collections()
    for (let collection of collections) {
      await collection.deleteMany({})
    }
  }
}) 
