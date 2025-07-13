import { Router } from 'express'
import { ObjectId } from 'mongodb'

import UserController from '../controllers/user.controller.js'
import ValidateMiddleware from '../middleware/validate.middleware.js'
import VerifyMiddleware from '../middleware/verify.middleware.js'

const route = Router()

route
  .route('/')
  .post(ValidateMiddleware.validateCreateUser, UserController.createUser)

route
  .route('/:id')
  .get(ValidateMiddleware.validateId, UserController.getUser)
  .put(ValidateMiddleware.validateId, UserController.updateUser)
  .delete(ValidateMiddleware.validateId, UserController.deleteUser)

route
  .route('/me')
  .get(VerifyMiddleware.checkAuth, UserController.getMyProfile)
  .put(VerifyMiddleware.checkAuth, UserController.updateMyProfile)

export default route