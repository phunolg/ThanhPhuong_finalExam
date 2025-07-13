import express from 'express'
import multer from 'multer'
import path, { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import hashProvider from './providers/hash.provider.js'
import 'dotenv/config'
import { connectDB } from './config/database.config.js'
import authRoutes from './routes/auth.route.js'
import userRoutes from './routes/user.route.js'
import eventRoutes from './routes/event.route.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const upload = multer({ dest: 'uploads/' })

const startApp = async () => {
  const app = express()
  const port = process.env.PORT || 3001

  app.use(express.json())
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
  
  // Routes
  app.use('/auth', authRoutes)
  app.use('/user', userRoutes)
  app.use('/events', eventRoutes)

  // Health check
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Final Exam API with Event Management is running!',
      port: port,
      routes: [
        // Auth routes
        'POST /auth/register',
        'POST /auth/login', 
        'POST /auth/forgot-password',
        'POST /auth/reset-password',
        'GET /auth/get-me',
        
        // User routes
        'GET /user/me',
        'PUT /user/me',
        
        // Event routes
        'POST /events (Admin)',
        'GET /events (Public)',
        'GET /events/:id (Public)',
        'PUT /events/:id (Admin)',
        'DELETE /events/:id (Admin)',
        'PATCH /events/:id/lock (Admin)',
        'PATCH /events/:id/unlock (Admin)',
        'POST /events/:id/register (User)',
        'DELETE /events/:id/register (User)',
        'GET /events/:id/registrations (Admin)'
      ]
    })
  })

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
      success: false,
      message: err.message || 'Something went wrong!'
    })
  })

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
  })
}

const runApp = async () => {
  try {
    await connectDB()
    startApp()
  } catch (err) {
    console.error('Error connecting to MongoDB:', err)
    process.exit(1)
  }
}

runApp()