const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../../src/app')
const User = require('../../src/models/User')
const Role = require('../../src/models/Role')
const Client = require('../../src/models/Client')
const jwt = require('jsonwebtoken')

describe('User Client Filtering', () => {
  let client1, client2
  let clientSuperAdminToken
  let roles, client2Users

  beforeAll(async () => {
    // Create test clients
    client1 = await Client.create({
      name: 'Test Client 1',
      code: 'TC1',
      active: true
    })
    client2 = await Client.create({
      name: 'Test Client 2',
      code: 'TC2',
      active: true
    })

    // Create roles
    roles = await Role.insertMany([
      { name: 'Client Super Admin', hierarchyLevel: 2 },
      { name: 'Client Admin', hierarchyLevel: 3 }
    ])

    // Create test users
    const [, , client2Admin] = await User.insertMany([
      {
        name: 'Client Super Admin 1',
        email: 'csa1@test.com',
        password: 'password123',
        role: roles[0]._id,
        client: client1._id
      },
      {
        name: 'Client Admin 1',
        email: 'ca1@test.com',
        password: 'password123',
        role: roles[1]._id,
        client: client1._id
      },
      {
        name: 'Client Admin 2',
        email: 'ca2@test.com',
        password: 'password123',
        role: roles[1]._id,
        client: client2._id
      }
    ])

    client2Users = [client2Admin._id]

    // Create token for Client Super Admin
    clientSuperAdminToken = jwt.sign(
      {
        role: { hierarchyLevel: 2 },
        client: { id: client1._id }
      },
      process.env.JWT_SECRET
    )
  })

  describe('GET /users', () => {
    it('should return only users from the same client', async () => {
      const res = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${clientSuperAdminToken}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2) // Should only return users from client1
      expect(res.body.every(user => 
        user.client._id.toString() === client1._id.toString()
      )).toBe(true)

      // Verify that no users from client2 are included
      const returnedUserIds = res.body.map(user => user._id)
      expect(
        returnedUserIds.some(id => 
          client2Users.some(c2id => c2id.toString() === id.toString())
        )
      ).toBe(false)
    })
  })

  afterAll(async () => {
    await User.deleteMany({})
    await Role.deleteMany({})
    await Client.deleteMany({})
  })
}) 
