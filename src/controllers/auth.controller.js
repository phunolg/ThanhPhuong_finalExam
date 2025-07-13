import authService from '../services/auth.service.js'

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, role } = req.body
      const user = await authService.register(email, password, role)
      return res.status(201).json({
        success: true,
        data: user,
      })
    } catch (err) {
      next(err)
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body
      const token = await authService.login(email, password)
      res.status(200).json({
        success: true,
        token: token,
        message: 'Login successfully',
      })
    } catch (err) {
      next(err)
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body
      const check = await authService.forgotPassword(email)
      if (!check) {
        return res.status(400).json({
          success: false,
          message: 'Email not found',
        })
      } else {
        return res.status(200).json({
          success: true,
          message: 'Email sent successfully',
        })
      }
    } catch (err) {
      next(err)
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { email, passwordResetToken, newPassword } = req.body
      const check = await authService.resetPassword(
        email,
        passwordResetToken,
        newPassword
      )

      if (check) {
        return res.status(200).json({
          success: true,
          message: 'Password reset successfully',
        })
      }
      if (!check) {
        return res.status(400).json({
          success: false,
          message: 'Password reset failed',
        })
      }
    } catch (err) {
      next(err)
    }
  }

  async getMe(req, res, next) {
    try {
      const userId = req.user
      const user = await authService.getMe(userId)
      res.status(200).json({
        success: true,
        data: user,
      })
    } catch (err) {
      next(err)
    }
  }
}

export default new AuthController()

