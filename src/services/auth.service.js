import UserModel from '../models/user.model.js'
import { getDB } from '../config/database.config.js'
import bcrypt from 'bcrypt'
import { ObjectId } from 'mongodb'
import emailProvider from '../providers/email.provider.js'
import hashProvider from '../providers/hash.provider.js'

// nơi chứa các hàm xử lý logic liên quan đến người dùng
class authService {
  async register(email, password, role = 'User') {
    try {
      const existingUser = await UserModel.getAllUsers()
      if (existingUser.some((user) => user.email === email)) {
        throw new Error('User already exists')
      }

      // tạo hash
      const hashedPassword = await bcrypt.hash(password, 10)

      // lưu email, hash password và role vào db
      const newUser = await UserModel.createUser(email, hashedPassword, role)

      return newUser
    } catch (error) {
      throw new Error('Error registering user: ' + error.message)
    }
  }
  async login(email, password) {
    console.log('Login attempt for email:', email)
    const user = await UserModel.getUserByEmail(email, password)
    if (!user) {
      throw new Error('Invalid email')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid password')
    }

    console.log(
      'User authenticated successfully, generating token for user ID:',
      user._id
    )
    const token = await authProvider.encodeToken(user)
    console.log('Generated token:', token.substring(0, 20) + '...')
    return token
  }

  async getMe(id) {
    try {
      const db = getDB()
      const user = await db
        .collection('users')
        .findOne({ _id: new ObjectId(id) })
      if (!user) {
        throw new Error('User not found')
      }
      return user
    } catch (err) {
      throw err
    }
  }

  async forgotPassword(email) {
    try {
      const user = await UserModel.getUserByEmail(email)
      if (!user) {
        throw new Error('Email not found')
      }

      const resetPasswordToken = await bcrypt.genSalt(10)
      const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000) // Hết hạn sau 15 phút
      const result = await UserModel.updateUserByEmail(email, {
        resetPasswordToken,
        resetPasswordExpires,
      })
      if (!result) {
        throw new Error('Error setting reset password token')
      }

      await emailProvider.sendEmail({
        emailFrom: process.env.SMTP_USER,
        emailTo: email,
        emailSubject: 'Reset Password',
        emailText: `Your reset password token is: ${resetPasswordToken}`,
      })
      return true
    } catch (error) {
      throw new Error('Error sending email: ' + error.message)
    }
  }

  async resetPassword(email, passwordResetToken, newPassword) {
    try {
      const user = await UserModel.checkResetPasswordToken(
        email,
        passwordResetToken
      )
      if (!user) {
        throw new Error('Invalid token or token expired')
      }

      const password = await hashProvider.generateHash(newPassword)
      const updateStatus = await UserModel.resetPassword(password, email)
      if (!updateStatus) {
        throw new Error('Error updating password')
      }
      return true
    } catch (error) {
      throw new Error('Error resetting password: ' + error.message)
    }
  }
}

export default new authService()
