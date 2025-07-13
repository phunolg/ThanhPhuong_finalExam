import { MongoClient } from 'mongodb'
import mongoose from 'mongoose'
import 'dotenv/config'

let dbInstance = null
const client = new MongoClient(process.env.MONGODB_URI)

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Database connection failed:', error.message)
    process.exit(1)
  }
}

const connectDB = async () => {
  try {
    await client.connect()
    dbInstance = client.db(process.env.DB_NAME)
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('Error connecting to MongoDB:', err)
    throw err
  }
}

const getDB = () => {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call connectDB first.')
  }
  return dbInstance
}

export { connectDatabase, connectDB, getDB }
export default connectDatabase