require('dotenv').config()
const mongoose = require('mongoose')
const readline = require('readline')
const User = require('../src/models/User')
const config = require('../src/config')
const Role = require('../src/models/Role')
const inquirer = require('inquirer')
const validator = require('validator')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function createUser() {
  try {
    await mongoose.connect(config.mongoUri)
    console.log('Connected to MongoDB')

    // Get available roles
    const roles = await Role.find({})
    if (roles.length === 0) {
      console.error('No roles found. Please run init-db first.')
      process.exit(1)
    }

    // Get role names for choices
    const roleNames = roles.map(role => role.name)

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter user name:',
        validate: input => input.length >= 2 || 'Name must be at least 2 characters'
      },
      {
        type: 'input',
        name: 'email',
        message: 'Enter user email:',
        validate: input => validator.isEmail(input) || 'Please enter a valid email'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter password:',
        validate: input => input.length >= 8 || 'Password must be at least 8 characters'
      },
      {
        type: 'list',
        name: 'role',
        message: 'Select user role:',
        choices: roleNames
      }
    ])

    // Find the selected role
    const role = roles.find(r => r.name === answers.role)
    if (!role) {
      throw new Error('Selected role not found')
    }

    // Create user with selected role
    const user = new User({
      name: answers.name,
      email: answers.email,
      password: answers.password,
      role: role._id
    })

    // Add clientId if required for the role
    if (role.name === 'Client Super Admin' || role.name === 'Client Admin') {
      const clientId = await question('Enter client ID: ')
      user.clientId = clientId
    }

    console.log('User:', JSON.stringify(user, null, 2))
    await user.save()
    console.log('\nUser created successfully!')
    console.log('Name:', answers.name)
    console.log('Email:', answers.email)
    console.log('Role:', role.name)

  } catch (error) {
    console.error('Error creating user:', error)
    process.exit(1)
  } finally {
    rl.close()
    await mongoose.connection.close()
  }
}

createUser() 
