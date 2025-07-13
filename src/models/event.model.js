import { getDB } from '../config/database.config.js'
import { ObjectId } from 'mongodb'

class EventModel {
    // Create an event
    async createEvent(eventData) {
        const db = getDB()
        const event = {
        ...eventData,
        createdAt: new Date(),
        updatedAt: new Date()
        }
        return await db.collection('events').insertOne(event)
    }

    // Get all events
    async getAllEvents() {
        const db = getDB()
        return await db.collection('events').find({}).toArray()
    }

    // Get event by ID
    async getEventById(id) {
        const db = getDB()
        return await db.collection('events').findOne({ _id: new ObjectId(id) })
    }

    // Update event by ID
    async updateEventById(id, updateData) {
        const db = getDB()
        const updatedData = {
        ...updateData,
        updatedAt: new Date()
        }
        return await db.collection('events').updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
        )
    }

    // Delete event by ID
    async deleteEventById(id) {
        const db = getDB()
        return await db.collection('events').deleteOne({ _id: new ObjectId(id) })
    }

    // Lock/Unlock event
    async toggleEventLock(id, isLocked) {
        const db = getDB()
        return await db.collection('events').updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                isLocked: isLocked,
                updatedAt: new Date()
                }
            }
        )
    }

    async isUserRegistered(eventId, userId) {
        const db = getDB()
        const registration = await db.collection('registrations').findOne({
        eventId: new ObjectId(eventId),
        userId: new ObjectId(userId)
        })
        return !!registration
    }

    // Register user for event
    async registerUserForEvent(eventId, userId) {
        const db = getDB()
        return await db.collection('registrations').insertOne({
        eventId: new ObjectId(eventId),
        userId: new ObjectId(userId),
        registeredAt: new Date()
        })
    }

    // Cancel user registration
    async cancelUserRegistration(eventId, userId) {
        const db = getDB()
        return await db.collection('registrations').deleteOne({
        eventId: new ObjectId(eventId),
        userId: new ObjectId(userId)
        })
    }

    // Get all registrations for an event
    async getEventRegistrations(eventId) {
        const db = getDB()
        return await db.collection('registrations').aggregate([
        {
            $match: { eventId: new ObjectId(eventId) }
        },
        {
            $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
            }
        },
        {
            $unwind: '$user'
        },
        {
            $project: {
            _id: 1,
            registeredAt: 1,
            'user._id': 1,
            'user.email': 1,
            'user.name': 1,
            'user.role': 1
            }
        }
        ]).toArray()
    }

    // Get registration count for event
    async getRegistrationCount(eventId) {
        const db = getDB()
        return await db.collection('registrations').countDocuments({
        eventId: new ObjectId(eventId)
        })
    }
}

export default new EventModel()