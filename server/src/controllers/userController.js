const User = require('../models/User')
const Role = require('../models/Role')
const { getClientId } = require('../utils/clientUtils')
const { errorResponse } = require('../utils/errorResponse')

class UserController {
  async listUsers(req, res) {
    try {
      // The middleware will automatically apply security filters
      const users = await User.find()
        .setOptions({ currentUser: req.user })
        .populate('role', 'name hierarchyLevel')
        .populate('client', 'name code')
        .select('-password');
      
      res.json(users)
    } catch (error) {
      errorResponse(res, 'SERVER_ERROR', 'Error listing users', error.message)
    }
  }

  async getUser(req, res) {
    try {
      const user = await User.findById(req.params.id)
        .setOptions({ currentUser: req.user })
        .populate('role', 'name')
        .select('-password');
      
      if (!user) {
        return errorResponse(res, 'NOT_FOUND', 'User not found')
      }
      
      res.json(user)
    } catch (error) {
      errorResponse(res, 'SERVER_ERROR', 'Error fetching user', error.message)
    }
  }

  async createUser(req, res) {
    try {
      const { name, email, password, role } = req.body;
      let { client } = req.body;

      // Get the selected role to check its hierarchy level
      const selectedRole = await Role.findById(role);
      if (!selectedRole) {
        return errorResponse(res, 'VALIDATION', 'Invalid role');
      }

      // Check hierarchy level permission
      if (req.user.role.hierarchyLevel >= selectedRole.hierarchyLevel) {
        return errorResponse(
          res,
          'AUTHORIZATION',
          'Cannot create user with equal or higher role level than your own'
        );
      }

      // Create user data object
      const userData = {
        name,
        email,
        password,
        role
      };

      // Handle client assignment based on role hierarchy level
      // Client-scoped roles have hierarchy level >= 2
      if (selectedRole.hierarchyLevel >= 2) {
        if (!client && req.user && req.user.client) {
          // For client-scoped roles without explicit client, use the creator's client
          userData.client = getClientId(req.user.client);
        } else if (client) {
          // Use the provided client
          userData.client = client;
        } else {
          return errorResponse(res, 'VALIDATION', 'Client is required for client-scoped roles');
        }
      } else if (client) {
        // For system roles, client is optional
        userData.client = client;
      }

      // Set createdBy if user is authenticated
      if (req.user) {
        userData.createdBy = req.user.id || req.user._id;
      }

      // Create the user (no security filter needed for creation)
      const user = await User.create(userData);

      // Return populated user data
      const populatedUser = await User.findById(user._id)
        .populate('role', 'name hierarchyLevel')
        .populate('client', 'name code')
        .select('-password');

      res.status(201).json(populatedUser);
    } catch (error) {
      // Check for duplicate email error
      if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
        return errorResponse(res, 'VALIDATION', 'Email address is already in use');
      }
      errorResponse(res, 'VALIDATION', 'Error creating user', error.message);
    }
  }

  async updateUser(req, res) {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { 
          new: true, 
          runValidators: true,
          currentUser: req.user // Pass current user to trigger middleware
        }
      )
        .populate('role')
        .populate('client');

      if (!user) {
        return errorResponse(res, 'NOT_FOUND', 'User not found')
      }

      res.json(user)
    } catch (error) {
      errorResponse(res, 'VALIDATION', 'Error updating user', error.message)
    }
  }

  async deleteUser(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.id)
        .setOptions({ currentUser: req.user });
      
      if (!user) {
        return errorResponse(res, 'NOT_FOUND', 'User not found')
      }

      res.json({ message: 'User deleted successfully' })
    } catch (error) {
      errorResponse(res, 'SERVER_ERROR', 'Error deleting user', error.message)
    }
  }
}

module.exports = new UserController() 
