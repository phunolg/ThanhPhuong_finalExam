import { Router } from 'express'
import AuthController from '../controllers/auth.controller.js'
import VerifyMiddleware from '../middleware/verify.middleware.js'

const router = Router()

router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.post('/forgot-password', AuthController.forgotPassword)
router.post('/reset-password', AuthController.resetPassword)

router.get('/get-me', VerifyMiddleware.checkAuth, AuthController.getMe)

export default router