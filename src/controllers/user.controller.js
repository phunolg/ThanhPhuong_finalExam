import UserService from '../services/user.service.js'
import { body, param, validationResult } from 'express-validator'
import { getDB } from '../config/database.config.js'
import { ObjectId } from 'mongodb'

class UserController {
  // Create a user
  async createUser(req, res, next) {
    await body('email').isEmail().withMessage('Invalid email').run(req)
    await body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .run(req)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    try {
      const { email, password } = req.body
      const user = await UserService.createUser(email, password)
      return res.status(200).json({
        success: true,
        data: user,
      })
    } catch (err) {
      next(err)
    }
  }

  // Get all users
  async getAllUsers(req, res, next) {
    try {
      const users = await UserService.getAllUsers()
      return res.status(200).json({
        success: true,
        data: users,
      })
    } catch (err) {
      next(err)
    }
  }

  // Get a user by ID
  async getUser(req, res, next) {
    await param('id').isMongoId().withMessage('Invalid user ID').run(req)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    try {
      const id = req.params.id
      const user = await UserService.getUser(id)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        })
      }
      return res.status(200).json({
        success: true,
        data: user,
      })
    } catch (err) {
      next(err)
    }
  }

  // Update a user
  async updateUser(req, res, next) {
    await param('id').isMongoId().withMessage('Invalid user ID').run(req)

    await body('email')
      .optional()
      .isEmail()
      .withMessage('Invalid email')
      .run(req)
    await body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .run(req)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    try {
      const id = req.params.id
      const updateData = req.body
      const result = await UserService.updateUser(id, updateData)
      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        })
      }
      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
      })
    } catch (err) {
      next(err)
    }
  }

  // Delete a user
  async deleteUser(req, res, next) {
    await param('id').isMongoId().withMessage('Invalid user ID').run(req)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    try {
      const id = req.params.id
      const result = await UserService.deleteUser(id)
      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        })
      }
      return res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      })
    } catch (err) {
      next(err)
    }
  }

  // Get current user profile
  async getMyProfile(req, res, next) {
    try {
      const userId = req.user
      const user = await UserService.getUser(userId)
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        })
      }
      const { password, resetPasswordToken, resetPasswordExpires, ...userProfile } = user
      
      return res.status(200).json({
        success: true,
        data: userProfile,
        message: 'Profile retrieved successfully'
      })
    } catch (err) {
      next(err)
    }
  }

  //Update current user profile
  async updateMyProfile(req, res, next) {
    await body('email')
      .optional()
      .isEmail()
      .withMessage('Invalid email format')
      .run(req)
    
    await body('name')
      .optional()
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters')
      .run(req)
    
    await body('phone')
      .optional()
      .matches(/^[0-9]{10,11}$/)
      .withMessage('Phone number must be 10-11 digits')
      .run(req)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      })
    }

    try {
      const userId = req.user
      const updateData = req.body
      const allowedFields = ['name', 'phone', 'avatar']
      const filteredUpdateData = {}
      
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredUpdateData[key] = updateData[key]
        }
      })
      if (updateData.email) {
        const existingUser = await UserService.getUserByEmail(updateData.email)
        if (existingUser && existingUser._id.toString() !== userId) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          })
        }
        filteredUpdateData.email = updateData.email
      }

      const result = await UserService.updateUser(userId, filteredUpdateData)
      
      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        })
      }

      const updatedUser = await UserService.getUser(userId)
      const { password, resetPasswordToken, resetPasswordExpires, ...userProfile } = updatedUser

      return res.status(200).json({
        success: true,
        data: userProfile,
        message: 'Profile updated successfully',
      })
    } catch (err) {
      next(err)
    }
  }
}

export default new UserController()