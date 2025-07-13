import EventService from '../services/event.service.js'
import { body, param, validationResult } from 'express-validator'

class EventController {
    async createEvent(req, res, next) {
        await body('title')
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be 3-100 characters')
        .run(req)
        
        await body('description')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be 10-1000 characters')
        .run(req)
        
        await body('location')
        .isLength({ min: 3, max: 200 })
        .withMessage('Location must be 3-200 characters')
        .run(req)
        
        await body('startTime')
        .isISO8601()
        .withMessage('Start time must be a valid date')
        .run(req)
        
        await body('endTime')
        .isISO8601()
        .withMessage('End time must be a valid date')
        .run(req)

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        })
        }

        try {
        const userId = req.user
        const result = await EventService.createEvent(req.body, userId)
        
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: { eventId: result.insertedId }
        })
        } catch (error) {
        next(error)
        }
    }

    async getAllEvents(req, res, next) {
        try {
        const events = await EventService.getAllEvents()
        
        res.status(200).json({
            success: true,
            data: events,
            count: events.length
        })
        } catch (error) {
        next(error)
        }
    }

    async getEventById(req, res, next) {
        await param('id')
        .isMongoId()
        .withMessage('Invalid event ID')
        .run(req)

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        })
        }

        try {
        const event = await EventService.getEventById(req.params.id)
        
        res.status(200).json({
            success: true,
            data: event
        })
        } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
            success: false,
            message: error.message
            })
        }
        next(error)
        }
    }

    async updateEvent(req, res, next) {
        await param('id')
        .isMongoId()
        .withMessage('Invalid event ID')
        .run(req)

        await body('title')
        .optional()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be 3-100 characters')
        .run(req)
        
        await body('description')
        .optional()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be 10-1000 characters')
        .run(req)

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        })
        }

        try {
        const userId = req.user
        const result = await EventService.updateEvent(req.params.id, req.body, userId)
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
            success: false,
            message: 'Event not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Event updated successfully'
        })
        } catch (error) {
        if (error.message.includes('not found') || error.message.includes('Not authorized')) {
            return res.status(error.message.includes('Not authorized') ? 403 : 404).json({
            success: false,
            message: error.message
            })
        }
        next(error)
        }
    }

    async deleteEvent(req, res, next) {
        await param('id')
        .isMongoId()
        .withMessage('Invalid event ID')
        .run(req)

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        })
        }

        try {
        const userId = req.user
        const result = await EventService.deleteEvent(req.params.id, userId)
        
        if (result.deletedCount === 0) {
            return res.status(404).json({
            success: false,
            message: 'Event not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        })
        } catch (error) {
        if (error.message.includes('not found') || error.message.includes('Not authorized')) {
            return res.status(error.message.includes('Not authorized') ? 403 : 404).json({
            success: false,
            message: error.message
            })
        }
        next(error)
        }
    }

    async lockEvent(req, res, next) {
        await param('id')
        .isMongoId()
        .withMessage('Invalid event ID')
        .run(req)

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        })
        }

        try {
        const userId = req.user
        const result = await EventService.lockEvent(req.params.id, userId)
        
        res.status(200).json({
            success: true,
            message: 'Event locked successfully'
        })
        } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
            success: false,
            message: error.message
            })
        }
        next(error)
        }
    }

    async unlockEvent(req, res, next) {
        await param('id')
        .isMongoId()
        .withMessage('Invalid event ID')
        .run(req)

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        })
        }

        try {
        const userId = req.user
        const result = await EventService.unlockEvent(req.params.id, userId)
        
        res.status(200).json({
            success: true,
            message: 'Event unlocked successfully'
        })
        } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
            success: false,
            message: error.message
            })
        }
        next(error)
        }
    }

    async registerForEvent(req, res, next) {
        await param('id')
        .isMongoId()
        .withMessage('Invalid event ID')
        .run(req)

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        })
        }

        try {
        const userId = req.user
        const result = await EventService.registerForEvent(req.params.id, userId)
        
        res.status(201).json({
            success: true,
            message: 'Successfully registered for event'
        })
        } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
            success: false,
            message: error.message
            })
        }
        if (error.message.includes('Already registered') || 
            error.message.includes('locked') || 
            error.message.includes('past events')) {
            return res.status(400).json({
            success: false,
            message: error.message
            })
        }
        next(error)
        }
    }

    async cancelRegistration(req, res, next) {
        await param('id')
        .isMongoId()
        .withMessage('Invalid event ID')
        .run(req)

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        })
        }

        try {
        const userId = req.user
        const result = await EventService.cancelRegistration(req.params.id, userId)
        
        res.status(200).json({
            success: true,
            message: 'Registration cancelled successfully'
        })
        } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
            success: false,
            message: error.message
            })
        }
        if (error.message.includes('Not registered') || 
            error.message.includes('past events')) {
            return res.status(400).json({
            success: false,
            message: error.message
            })
        }
        next(error)
        }
    }

    async getEventRegistrations(req, res, next) {
        await param('id')
        .isMongoId()
        .withMessage('Invalid event ID')
        .run(req)

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        })
        }

        try {
        const userId = req.user
        const registrations = await EventService.getEventRegistrations(req.params.id, userId)
        
        res.status(200).json({
            success: true,
            data: registrations,
            count: registrations.length
        })
        } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
            success: false,
            message: error.message
            })
        }
        if (error.message.includes('Not authorized')) {
            return res.status(403).json({
            success: false,
            message: error.message
            })
        }
        next(error)
        }
    }
}

export default new EventController()