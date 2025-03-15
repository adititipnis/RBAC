require('dotenv').config()
const mongoose = require('mongoose')
const readline = require('readline')
const User = require('../src/models/User')
const config = require('../src/config')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function createUser() {
  try {
    await mongoose.connect(config.mongoUri)
    console.log('Connected to MongoDB')

    const username = await question('Enter username: ')
    const password = await question('Enter password: ')
    const role = await question('Enter role (admin/user): ')

    const user = new User({
      username,
      password,
      role: role.toLowerCase()
    })

    await user.save()
    console.log('User created successfully!')

  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    rl.close()
    await mongoose.connection.close()
    process.exit(0)
  }
}

createUser() 
