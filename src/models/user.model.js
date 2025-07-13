import { getDB } from '../config/database.config.js'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'

class UserModel {
  // Create a user
  async createUser(email, password, role = 'User') {
    const db = getDB()
    return await db.collection('users').insertOne({ email, password, role })
  }

  // Get all users
  async getAllUsers() {
    const db = getDB()
    return await db.collection('users').find({}).toArray()
  }

  // Get a user by ID
  async getUserById(id) {
    const db = getDB()
    return await db.collection('users').findOne({ _id: new ObjectId(id) })
  }

  // Update user by ID
  async updateUserById(id, updateData) {
    const db = getDB()
    return await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
  }

  async findOne(condition) {
    const db = getDB()
    return await db.collection('users').findOne(condition)
  }

  async updateUserByEmail(email, updateData) {
    const db = getDB()
    return await db.collection('users').updateOne(
      { email: email },
      { $set: updateData }
    )
  }

  // Delete a user by ID
  async deleteUserById(id) {
    const db = getDB()
    return await db.collection('users').deleteOne({ _id: new ObjectId(id) })
  }

  async getUserByEmailAndPassword(email, password) {
    const db = getDB()
    const user = await db.collection('users').findOne({ email })
    if (!user) {
      return null
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return null
    }
    return user
  }

  async getUserByEmail(email) {
    const db = getDB()
    return await db.collection('users').findOne({ email })
  }

  async checkResetPasswordToken(email, resetPasswordToken) {
    try {
      const result = await getDB()
        .collection('users')
        .findOne({
          email: email,
          resetPasswordToken: resetPasswordToken,
          resetPasswordExpires: { $gt: new Date() },
        })
      console.log('result', result)
      return result
    } catch (error) {
      throw error
    }
  }

  async resetPassword(newPassword, email) {
    try {
      const result = await getDB()
        .collection('users')
        .updateOne(
          { email: email },
          {
            $set: {
              password: newPassword,
              resetPasswordToken: null,
              resetPasswordExpiration: null,
              lastResetPasswordDate: new Date(),
            },
          }
        )
      return result.matchedCount > 0
    } catch (error) {
      throw error
    }
  }

  async getUserRoleById(id) {
    const db = getDB()
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) }, { projection: { role: 1 } })
    return user.role || 'User'
  }
}

export default new UserModel()