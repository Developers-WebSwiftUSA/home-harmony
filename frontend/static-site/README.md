# Static Site Demo

This is a static version of the House Tour Guide application, designed to work without a backend server. All data is mocked and stored in memory.

## Features

- ✅ Complete frontend replication
- ✅ Mock data for all entities (users, properties, tours, messages, favorites)
- ✅ No backend required - fully static
- ✅ All dashboards accessible (Admin, Buyer, Seller, Agent)
- ✅ Quick access links on login page

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Demo Accounts

You can use any email/password combination to login, or use these demo accounts:

- **Admin**: `admin@example.com` (any password)
- **Buyer**: `buyer@example.com` (any password)
- **Seller**: `seller@example.com` (any password)
- **Agent**: `agent@example.com` (any password)

## Quick Access

On the login page, you'll find quick access buttons to all dashboards:
- Admin Dashboard
- Buyer Dashboard
- Seller Dashboard
- Agent Dashboard

Click any dashboard to explore (no login required in demo mode).

## Notes

- All data is stored in memory and will reset on page refresh
- No real authentication - any email/password will work
- Socket.IO is disabled (no real-time features)
- File uploads return mock URLs
- All API calls are simulated with delays

## Structure

- `src/data/mockData.ts` - All sample data
- `src/services/*.service.ts` - Mock service implementations
- `src/context/AuthContext.tsx` - Simplified auth without backend
- `src/components/auth/ProtectedRoute.tsx` - Allows demo access

## Differences from Main App

- No Socket.IO connection
- No real API calls
- All services use mock data
- Protected routes allow demo access
- Login accepts any credentials
