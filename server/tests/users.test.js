const request = require('supertest')
const app = require('../src/index')
const User = require('../src/models/User')
const Role = require('../src/models/Role')

describe('User Management', () => {
  let token
  let superAdminRole

  beforeEach(async () => {
    // Create test role
    superAdminRole = await Role.create({
      name: 'Super Admin',
      permissions: [
        {
          pageType: 'userManagement',
          allowedActions: ['create', 'read', 'update', 'delete', 'search']
        }
      ]
    })

    // Create admin user
    const admin = await User.create({
      name: 'Aditi Tipnis',
      email: 'adititipnis@gmail.com',
      password: 'abcd1234',
      role: superAdminRole._id
    })

    // Login to get token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'adititipnis@gmail.com',
        password: 'abcd1234'
      })

    token = loginResponse.body.token
  })

  describe('GET /users', () => {
    it('should list all users for admin', async () => {
      const res = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${token}`)

      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body)).toBeTruthy()
      expect(res.body[0]).toHaveProperty('name')
      expect(res.body[0]).toHaveProperty('email')
      expect(res.body[0]).toHaveProperty('role')
    })

    it('should create new user', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: superAdminRole._id
      }

      const res = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser)

      expect(res.statusCode).toBe(201)
      expect(res.body).toHaveProperty('name', newUser.name)
      expect(res.body).toHaveProperty('email', newUser.email)
      expect(res.body.role).toHaveProperty('name', 'Super Admin')
    })

    it('should update existing user', async () => {
      // Create a user to update
      const user = await User.create({
        name: 'Update Test',
        email: 'update@test.com',
        password: 'password123',
        role: superAdminRole._id
      })

      const update = {
        name: 'Updated Name'
      }

      const res = await request(app)
        .put(`/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(update)

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('name', update.name)
    })

    it('should delete user', async () => {
      // Create a user to delete
      const user = await User.create({
        name: 'Delete Test',
        email: 'delete@test.com',
        password: 'password123',
        role: superAdminRole._id
      })

      const res = await request(app)
        .delete(`/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('message', 'User deleted successfully')

      // Verify user is deleted
      const deletedUser = await User.findById(user._id)
      expect(deletedUser).toBeNull()
    })
  })
}) 
