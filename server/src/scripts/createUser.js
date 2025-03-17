require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')
const Role = require('../models/Role')
const inquirer = require('inquirer')

const MONGODB_URI = 'mongodb+srv://adititipnis:kCVcyAz4RhRf4sek@cluster0.rrsdh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

async function createUser() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // First get all roles
    const roles = await Role.find()
    if (!roles.length) {
      console.error('No roles found in database. Please create roles first.')
      process.exit(1)
    }

    // Prompt for user details
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter name:',
        validate: input => input.length >= 2
      },
      {
        type: 'input',
        name: 'email',
        message: 'Enter email:',
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter password:',
        validate: input => input.length >= 8
      },
      {
        type: 'list',
        name: 'roleName',
        message: 'Select role:',
        choices: roles.map(r => r.name)
      }
    ])

    // Find the selected role
    const role = await Role.findOne({ name: answers.roleName })
    if (!role) {
      throw new Error('Selected role not found')
    }

    // Create the user with single role
    const user = await User.create({
      name: answers.name,
      email: answers.email,
      password: answers.password,
      role: role._id  // Single role field
    })

    console.log('\nUser created successfully:')
    console.log('Name:', user.name)
    console.log('Email:', user.email)
    console.log('Role:', answers.roleName)

    await mongoose.connection.close()
    process.exit(0)

  } catch (error) {
    console.error('Failed to create user:', error.message)
    process.exit(1)
  }
}

createUser() 
