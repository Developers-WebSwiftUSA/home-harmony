# Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB running on localhost:27017

## Setup Steps

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Create Environment File (repository root — one file for backend + frontends)**
   ```bash
   cd ..
   cp .env.example .env
   ```

3. **Configure Environment Variables**
   Edit the repo root `.env` file and set:
   - `MONGODB_URI=mongodb://localhost:27017/real-estate-platform`
   - `JWT_SECRET=your-secret-key-here` (use a strong random string)
   - Other optional services (email, SMS) can be configured later

4. **Start MongoDB** (if not already running)
   ```bash
   # Windows
   mongod

   # Mac/Linux
   sudo systemctl start mongod
   # or
   mongod --dbpath /path/to/data
   ```

5. **Start the Server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

6. **Test the API**
   ```bash
   # Health check
   curl http://localhost:5000/api/health

   # Register a user
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "role": "buyer",
       "firstName": "John",
       "lastName": "Doe"
     }'
   ```

## Default Configuration
- Server runs on: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017/real-estate-platform`
- JWT expires in: 7 days

## API Testing
Use Postman, Insomnia, or curl to test the endpoints. See `README.md` for full API documentation.

## Next Steps
1. Test authentication endpoints
2. Create test users for each role (buyer, seller, agent, admin)
3. Create properties
4. Test tour scheduling
5. Test messaging system
