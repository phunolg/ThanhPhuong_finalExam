import UserModel from '../models/user.model.js'

class AdminMiddleware {
  async checkAdmin(req, res, next) {
    try {
      const userId = req.user
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
      }

      const user = await UserModel.getUserById(userId)
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      if (user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        })
      }

      next()
    } catch (error) {
      console.error('Admin check error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }
}

export default new AdminMiddleware()