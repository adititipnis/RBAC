const request = require('supertest')
const app = require('../src/index')
const User = require('../src/models/User')
const Role = require('../src/models/Role')

describe('Auth Endpoints', () => {
  let superAdminRole

  beforeEach(async () => {
    // Create test role
    superAdminRole = await Role.create({
      name: 'Super Admin',
      permissions: [
        {
          pageType: 'users',
          allowedActions: ['create', 'read', 'update', 'delete', 'search']
        }
      ]
    })

    // Create test user with your actual test credentials
    await User.create({
      name: 'Aditi Tipnis',
      email: 'adititipnis@gmai.com',
      password: 'password1234',
      role: superAdminRole._id
    })
  })

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'adititipnis@gmai.com',
          password: 'password1234'
        })

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('token')
      expect(res.body.user).toHaveProperty('name', 'Aditi Tipnis')
      expect(res.body.user).toHaveProperty('email', 'adititipnis@gmai.com')
      expect(res.body.user.role).toHaveProperty('name', 'Super Admin')
      expect(res.body.user).toHaveProperty('permissions')
    })

    it('should fail with invalid password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword'
        })

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('message', 'Invalid email or password')
    })

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        })

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('message', 'Invalid email or password')
    })

    it('should require email and password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({})

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('message', 'Email and password are required')
    })
  })
}) 
