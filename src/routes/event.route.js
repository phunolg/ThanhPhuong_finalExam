import { Router } from 'express'
import EventController from '../controllers/event.controller.js'
import VerifyMiddleware from '../middleware/verify.middleware.js'
import AdminMiddleware from '../middleware/admin.middleware.js'

const router = Router()

// Public routes
router.get('/', EventController.getAllEvents)
router.get('/:id', EventController.getEventById)

// Admin only routes
router.post('/', VerifyMiddleware.checkAuth, AdminMiddleware.checkAdmin, EventController.createEvent)
router.put('/:id', VerifyMiddleware.checkAuth, AdminMiddleware.checkAdmin, EventController.updateEvent)
router.delete('/:id', VerifyMiddleware.checkAuth, AdminMiddleware.checkAdmin, EventController.deleteEvent)
router.patch('/:id/lock', VerifyMiddleware.checkAuth, AdminMiddleware.checkAdmin, EventController.lockEvent)
router.patch('/:id/unlock', VerifyMiddleware.checkAuth, AdminMiddleware.checkAdmin, EventController.unlockEvent)
router.get('/:id/registrations', VerifyMiddleware.checkAuth, AdminMiddleware.checkAdmin, EventController.getEventRegistrations)

// User routes
router.post('/:id/register', VerifyMiddleware.checkAuth, EventController.registerForEvent)
router.delete('/:id/register', VerifyMiddleware.checkAuth, EventController.cancelRegistration)

export default router