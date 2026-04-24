import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Single repo-root .env for MongoDB, JWT, URLs, etc. (see /.env.example)
const repoRootEnv = path.resolve(__dirname, '..', '.env');
const frontendDist = path.resolve(__dirname, '..', 'frontend', 'dist');
const frontendIndex = path.join(frontendDist, 'index.html');

// Import Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import propertyRoutes from './routes/property.routes.js';
import tourRoutes from './routes/tour.routes.js';
import messageRoutes from './routes/message.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import favoriteRoutes from './routes/favorite.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import passwordResetRoutes from './routes/passwordReset.routes.js';
import agentRoutes from './routes/agent.routes.js';

dotenv.config({ path: repoRootEnv });

// Connect to MongoDB
connectDB();

const PORT = Number(process.env.PORT) || 5000;

// Initialize Express app
const app = express();
const httpServer = createServer(app);

/** Collect CORS / Socket.IO allowed origins (with and without trailing slash). */
const allowedOriginSet = new Set();
const addOrigin = (value) => {
  if (!value || typeof value !== 'string') return;
  const t = value.trim();
  if (!t) return;
  allowedOriginSet.add(t);
  allowedOriginSet.add(t.replace(/\/$/, ''));
};

addOrigin(process.env.FRONTEND_URL);
addOrigin(process.env.RENDER_EXTERNAL_URL);

[
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`,
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
].forEach(addOrigin);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, '');
  if (allowedOriginSet.has(origin) || allowedOriginSet.has(normalized)) return true;

  // Allow local development origins on any port
  return /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
};

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error("CORS not allowed"), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error("CORS not allowed"), false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join user's room for notifications
  socket.on('join-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set('io', io);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/password-resets', passwordResetRoutes);

const serveFrontend = fs.existsSync(frontendIndex);

if (serveFrontend) {
  console.log(`Serving SPA from ${frontendDist}`);
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.resolve(frontendIndex));
  });
}

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  }
  if ((req.method === 'GET' || req.method === 'HEAD') && !serveFrontend) {
    return res
      .status(503)
      .type('text')
      .send(
        'Frontend is not built. From the repository root run: npm run build\nThen restart the server.'
      );
  }
  return res.status(404).type('text').send('Not found');
});

// Error handler middleware (must be last)
app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  if (serveFrontend) {
    const publicUrl = process.env.RENDER_EXTERNAL_URL || process.env.FRONTEND_URL;
    console.log(`App URL: ${publicUrl || `http://localhost:${PORT}`}`);
  }
});

export default app;
