import { getDB } from '../config/database.config.js'
import { ObjectId } from 'mongodb'
import UserModel from '../models/user.model.js'

class UserService {
  async createUser(email, password) {
    try {
      return await UserModel.createUser(email, password)
    } catch (err) {
      throw new Error('Failed to create user: ' + err.message)
    }
  }

  async getAllUsers() {
    try {
      return await UserModel.getAllUsers()
    } catch (err) {
      throw new Error('Failed to fetch users: ' + err.message)
    }
  }

  async getUser(id) {
    try {
      return await UserModel.getUserById(id)
    } catch (err) {
      throw new Error('Failed to fetch user: ' + err.message)
    }
  }

  async getUserByEmail(email) {
    try {
      return await UserModel.getUserByEmail(email)
    } catch (err) {
      throw new Error('Failed to fetch user by email: ' + err.message)
    }
  }

  async updateUser(id, updateData) {
    try {
      return await UserModel.updateUserById(id, updateData)
    } catch (err) {
      throw new Error('Failed to update user: ' + err.message)
    }
  }

  async deleteUser(id) {
    try {
      return await UserModel.deleteUserById(id)
    } catch (err) {
      throw new Error('Failed to delete user: ' + err.message)
    }
  }
}

export default new UserService()