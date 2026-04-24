# Real Estate Platform - Backend API

A comprehensive backend API for a real estate platform built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Admin, Buyer, Seller, Agent)
- **Property Management**: CRUD operations, search, filters, geospatial queries
- **Tour Scheduling**: Request, confirm, cancel tours with calendar integration
- **Messaging System**: Real-time messaging between users with Socket.IO
- **Notifications**: Email, SMS, and in-app notifications
- **Favorites**: Save and manage favorite properties
- **Analytics**: Property views, inquiries tracking

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.IO
- **Email**: Nodemailer (SendGrid)
- **SMS**: Twilio
- **File Upload**: Multer, Cloudinary

## Project Structure

```
backend/
├── config/          # Configuration files
│   └── database.js  # MongoDB connection
├── controllers/      # Business logic
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── property.controller.js
│   ├── tour.controller.js
│   ├── message.controller.js
│   ├── notification.controller.js
│   └── favorite.controller.js
├── middleware/       # Custom middleware
│   ├── auth.middleware.js
│   ├── errorHandler.js
│   └── asyncHandler.js
├── models/          # Mongoose schemas
│   ├── User.model.js
│   ├── Property.model.js
│   ├── Tour.model.js
│   ├── Message.model.js
│   ├── Conversation.model.js
│   ├── Notification.model.js
│   ├── Favorite.model.js
│   └── PropertyView.model.js
├── routes/          # API routes
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── property.routes.js
│   ├── tour.routes.js
│   ├── message.routes.js
│   ├── notification.routes.js
│   └── favorite.routes.js
├── utils/           # Utility functions
│   ├── generateToken.js
│   ├── sendEmail.js
│   └── sendSMS.js
├── server.js        # Entry point
└── package.json
```

Environment variables live in the **repository root** (`.env`, template `../.env.example`). The server loads `../.env` only—not `backend/.env`.

## Installation

1. Install dependencies:
```bash
npm install
```

2. From the **repository root**, create `.env` (see `/.env.example`):
```bash
cd ..
cp .env.example .env
```

3. Edit the repo root `.env` with your configuration:
- MongoDB URI
- JWT Secret
- Email/SMS service credentials (optional for development)

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Run the server:
```bash
# Development (API only; use Vite in /frontend for UI)
npm run dev

# Production (API only)
npm start
```

### Serve API + built frontend together

From the **repository root**, build the SPA then start Node (serves `frontend/dist` on the same port as the API):

```bash
npm run serve
```

Open `http://localhost:5000` (or your `PORT`). For this mode, set in repo root `.env`: `FRONTEND_URL=http://localhost:5000` and `VITE_API_URL=/api`, then rebuild (`npm run build`).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/forgotpassword` - Request password reset

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)
- `PUT /api/users/:id/verify` - Verify agent (Admin)

### Properties
- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/:id` - Get property by ID
- `GET /api/properties/search/nearby` - Geospatial search
- `POST /api/properties` - Create property (Seller)
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `PUT /api/properties/:id/approve` - Approve property (Admin)
- `PUT /api/properties/:id/reject` - Reject property (Admin)

### Tours
- `GET /api/tours` - Get all tours
- `GET /api/tours/:id` - Get tour by ID
- `GET /api/tours/availability` - Get available time slots
- `POST /api/tours` - Create tour request (Buyer)
- `PUT /api/tours/:id/status` - Update tour status
- `POST /api/tours/:id/feedback` - Submit tour feedback (Buyer)

### Messages
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/conversations/:userId` - Get or create conversation
- `GET /api/messages/conversations/:conversationId/messages` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/conversations/:conversationId/read` - Mark as read

### Notifications
- `GET /api/notifications` - Get all notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Favorites
- `GET /api/favorites` - Get user favorites
- `GET /api/favorites/check/:propertyId` - Check if favorited
- `POST /api/favorites` - Add to favorites
- `PUT /api/favorites/:id` - Update favorite
- `DELETE /api/favorites/:id` - Remove from favorites

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Role-Based Access Control

- **Admin**: Full access to all resources
- **Buyer**: Can view properties, schedule tours, send messages
- **Seller**: Can create/manage properties, respond to tours
- **Agent**: Can manage clients, tours, properties

## Environment Variables

See **`/.env.example`** at the monorepo root for all variables (MongoDB, JWT, `VITE_API_URL`, etc.).

## Database Models

- **User**: Users with roles (admin, buyer, seller, agent)
- **Property**: Property listings with geospatial data
- **Tour**: Tour scheduling and management
- **Message**: Individual messages
- **Conversation**: Message threads
- **Notification**: User notifications
- **Favorite**: User favorite properties
- **PropertyView**: Property view tracking

## Development

The server runs on `http://localhost:5000` by default.

Socket.IO is configured for real-time features like messaging and notifications.

## Notes

- MongoDB connection URI is set to `mongodb://localhost:27017/real-estate-platform`
- JWT tokens expire in 7 days by default
- Email and SMS services are optional for development
- All timestamps are in UTC
