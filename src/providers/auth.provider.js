import jwt from 'jsonwebtoken'
import 'dotenv/config'

class AuthProvider {
  async encodeToken(user) {
    console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN)
    console.log('Creating token for user:', user._id.toString())

    try {
      const token = jwt.sign(
        { id: user._id.toString() },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '1h',
          algorithm: 'HS256',
        }
      )
      return token
    } catch (error) {
      console.error('Token generation error:', error)
      throw error
    }
  }

  async decodeToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      console.error('Token verification error:', error)
      throw error
    }
  }
}

export default new AuthProvider()
