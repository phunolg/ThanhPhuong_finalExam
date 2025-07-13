import EventModel from '../models/event.model.js'
import UserModel from '../models/user.model.js'
import { ObjectId } from 'mongodb'

class EventService {
     async createEvent(eventData, createdBy) {
        try {
        const event = {
            title: eventData.title,
            description: eventData.description,
            location: eventData.location,
            image: eventData.image || null,
            startTime: new Date(eventData.startTime),
            endTime: new Date(eventData.endTime),
            isLocked: false,
            createdBy: new ObjectId(createdBy)
        }

        if (event.startTime >= event.endTime) {
            throw new Error('Start time must be before end time')
        }
        if (event.startTime < new Date()) {
            throw new Error('Start time cannot be in the past')
        }

        const result = await EventModel.createEvent(event)
        return result
        } catch (error) {
        throw new Error('Failed to create event: ' + error.message)
        }
    }

    async getAllEvents() {
        try {
            const events = await EventModel.getAllEvents()
            const eventsWithCount = await Promise.all(
            events.map(async (event) => {
                const registrationCount = await EventModel.getRegistrationCount(event._id)
                return {
                    ...event,
                    registrationCount
                }
            })
        )

        return eventsWithCount
        } catch (error) {
            throw new Error('Failed to fetch events: ' + error.message)
        }
    }

    async getEventById(id) {
        try {
            const event = await EventModel.getEventById(id)
            if (!event) {
                throw new Error('Event not found')
            }

            // Add registration count
            const registrationCount = await EventModel.getRegistrationCount(id)
            
            return {
                ...event,
                registrationCount
            }
        }   catch (error) {
            throw new Error('Failed to fetch event: ' + error.message)
        }
    }

    async updateEvent(id, updateData, userId) {
        try {
            const event = await EventModel.getEventById(id)
            if (!event) {
                throw new Error('Event not found')
            }

            // Check if user is the creator or admin
            const user = await UserModel.getUserById(userId)
            if (user.role !== 'Admin' && event.createdBy.toString() !== userId) {
                throw new Error('Not authorized to update this event')
            }

            const filteredData = {}
            const allowedFields = ['title', 'description', 'location', 'image', 'startTime', 'endTime']
            
            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                if (field === 'startTime' || field === 'endTime') {
                    filteredData[field] = new Date(updateData[field])
                } else {
                    filteredData[field] = updateData[field]
                }
            }
        })

        // Validate dates if provided
        const newStartTime = filteredData.startTime || event.startTime
        const newEndTime = filteredData.endTime || event.endTime

        if (newStartTime >= newEndTime) {
            throw new Error('Start time must be before end time')
        }

        const result = await EventModel.updateEventById(id, filteredData)
        return result
        } catch (error) {
        throw new Error('Failed to update event: ' + error.message)
        }
    }

    async deleteEvent(id, userId) {
        try {
        const event = await EventModel.getEventById(id)
        if (!event) {
            throw new Error('Event not found')
        }

        // Check if user is admin or creator
        const user = await UserModel.getUserById(userId)
        if (user.role !== 'Admin' && event.createdBy.toString() !== userId) {
            throw new Error('Not authorized to delete this event')
        }

        const result = await EventModel.deleteEventById(id)
        return result
        } catch (error) {
        throw new Error('Failed to delete event: ' + error.message)
        }
    }

    async lockEvent(id, userId) {
        try {
        const result = await EventModel.toggleEventLock(id, true)
        if (result.matchedCount === 0) {
            throw new Error('Event not found')
        }
        return result
        } catch (error) {
        throw new Error('Failed to lock event: ' + error.message)
        }
    }

    async unlockEvent(id, userId) {
        try {
        const result = await EventModel.toggleEventLock(id, false)
        if (result.matchedCount === 0) {
            throw new Error('Event not found')
        }
        return result
        } catch (error) {
        throw new Error('Failed to unlock event: ' + error.message)
        }
    }

    async registerForEvent(eventId, userId) {
        try {
        const event = await EventModel.getEventById(eventId)
        if (!event) {
            throw new Error('Event not found')
        }

        if (event.isLocked) {
            throw new Error('Event registration is locked')
        }

        if (new Date() > event.startTime) {
            throw new Error('Cannot register for past events')
        }

        // Check if already registered
        const isRegistered = await EventModel.isUserRegistered(eventId, userId)
        if (isRegistered) {
            throw new Error('Already registered for this event')
        }

        const result = await EventModel.registerUserForEvent(eventId, userId)
        return result
        } catch (error) {
        throw new Error('Failed to register for event: ' + error.message)
        }
    }

    async cancelRegistration(eventId, userId) {
        try {
        const event = await EventModel.getEventById(eventId)
        if (!event) {
            throw new Error('Event not found')
        }

        if (new Date() > event.startTime) {
            throw new Error('Cannot cancel registration for past events')
        }

        const isRegistered = await EventModel.isUserRegistered(eventId, userId)
        if (!isRegistered) {
            throw new Error('Not registered for this event')
        }

        const result = await EventModel.cancelUserRegistration(eventId, userId)
        return result
        } catch (error) {
        throw new Error('Failed to cancel registration: ' + error.message)
        }
    }

    async getEventRegistrations(eventId, userId) {
        try {
        const event = await EventModel.getEventById(eventId)
        if (!event) {
            throw new Error('Event not found')
        }

        // Check user is admin or event creator
        const user = await UserModel.getUserById(userId)
        if (user.role !== 'Admin' && event.createdBy.toString() !== userId) {
            throw new Error('Not authorized to view registrations')
        }

        const registrations = await EventModel.getEventRegistrations(eventId)
        return registrations
        } catch (error) {
        throw new Error('Failed to fetch registrations: ' + error.message)
        }
    }
}

export default new EventService()