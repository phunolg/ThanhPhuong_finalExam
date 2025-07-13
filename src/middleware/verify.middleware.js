import authProvider from '../providers/auth.provider.js'
import UserModel from '../models/user.model.js'

class VerifyMiddleware {
  async checkAuth(req, res, next) {
    try {
      const headers = req.headers.authorization
      if (!headers) {
        throw new Error('No token provided')
      }

      const token = headers.split(' ')[1]
      if (!token) {
        throw new Error('Invalid token format')
      }

      console.log('Verifying token:', token.substring(0, 20) + '...')

      const decoded = await authProvider.decodeToken(token)
      if (!decoded || !decoded.id) {
        throw new Error('Invalid token payload')
      }

      req.user = decoded.id // Lấy id từ token và gắn vào req.user
      console.log('Token verified, user ID:', req.user)
      next()
    } catch (error) {
      console.error('Auth verification error:', error.name, error.message)

      let message = error.message
      if (error.name === 'TokenExpiredError') {
        message = 'Token has expired. Please login again.'
      } else if (error.name === 'JsonWebTokenError') {
        message = 'Invalid token. Please login again.'
      }

      res.status(401).json({
        success: false,
        message: message,
      })
    }
  }
}
export default new VerifyMiddleware()
