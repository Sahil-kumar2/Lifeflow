# Project Architecture Documentation

This document explains the refactored, production-grade architecture of the LiveFlow Blood Donation Platform.

## Overview

LiveFlow is a full-stack blood donation management system with:
- **Backend**: Node.js/Express API with MongoDB database
- **Frontend**: React/Vite single-page application
- **Features**: User authentication, blood request management, geolocation-based donor matching, gamification, AI-powered chatbot

---

## Backend Architecture

### Directory Structure

```
backend/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── server.js              # Server entry point
│   ├── config/
│   │   ├── db.js              # MongoDB connection configuration
│   │   └── index.js           # Centralized config exports
│   ├── models/
│   │   ├── User.js            # User schema (donor/patient/hospital)
│   │   ├── BloodRequest.js    # Blood request schema
│   │   ├── DonationLog.js     # Donation history schema
│   │   └── index.js           # Barrel export
│   ├── controllers/
│   │   ├── AuthController.js  # Authentication logic
│   │   ├── BloodRequestController.js  # Blood request handlers
│   │   ├── DonorController.js # Donor-specific operations
│   │   ├── HospitalController.js      # Hospital operations
│   │   ├── ChatController.js  # AI chatbot handler
│   │   └── index.js           # Barrel export
│   ├── services/
│   │   ├── AuthService.js     # Auth business logic
│   │   ├── BloodRequestService.js    # Request management logic
│   │   ├── DonorService.js    # Donor operations logic
│   │   ├── HospitalService.js # Hospital operations logic
│   │   ├── ChatService.js     # AI chat integration
│   │   └── index.js           # Barrel export
│   ├── routes/
│   │   ├── api/
│   │   │   ├── auth.js        # Auth endpoints (/api/auth)
│   │   │   ├── requests.js    # Blood request endpoints (/api/requests)
│   │   │   ├── donors.js      # Donor endpoints (/api/donors)
│   │   │   ├── hospitals.js   # Hospital endpoints (/api/hospitals)
│   │   │   ├── chat.js        # Chat endpoints (/api/chat)
│   │   │   └── index.js       # Route aggregation
│   │   └── index.js           # Route barrel export
│   ├── middlewares/
│   │   └── auth.js            # JWT authentication middleware
│   ├── validators/            # Route validation middleware (extensible)
│   ├── utils/
│   │   └── ensureIndexes.js   # Database index management
│   └── constants/             # App constants (extensible)
├── index.js                   # Entry point (delegates to src/server.js)
├── package.json
├── .env                       # Environment variables (not in git)
├── .env.example               # Example environment configuration
└── .gitignore
```

### Architectural Patterns

#### 1. **MVC + Services Pattern**
- **Controllers**: Thin route handlers that delegate to services
- **Services**: Business logic layer, database operations, external API calls
- **Models**: Mongoose schemas for data structure

#### 2. **Separation of Concerns**
- Routes → Controllers → Services → Models
- Each layer has a single responsibility
- No circular dependencies

#### 3. **Barrel Exports**
- `index.js` files aggregate exports for cleaner imports
- Example: `const { AuthService } = require('../services')`

### API Endpoints

```
Authentication
  POST   /api/auth/register      - Register new user
  POST   /api/auth/login         - User login
  GET    /api/auth               - Get current user profile

Blood Requests
  POST   /api/requests           - Create blood request
  GET    /api/requests           - Get all open requests
  GET    /api/requests/my-requests - Get user's requests
  GET    /api/requests/inprogress - Get in-progress requests
  POST   /api/requests/:id/accept - Accept blood request

Donors
  GET    /api/donors/donation-logs - Get donation history
  GET    /api/donors/nearby-requests - Get nearby requests
  PATCH  /api/donors/profile     - Update profile

Hospitals  
  POST   /api/hospitals/verify-donation - Verify donation & award badges

Chat (AI)
  POST   /api/chat               - Send message to AI chatbot
```

### Key Features

1. **Geospatial Queries**: Uses MongoDB 2dsphere indexes for location-based donor matching
2. **SMS Notifications**: Twilio integration to alert nearby donors
3. **Gamification**: Badge system (First Donation, 5 Donations Club, Blood Hero)
4. **AI Chatbot**: Google Generative AI integration for user support
5. **JWT Authentication**: Secure token-based authentication

---

## Frontend Architecture

### Directory Structure

```
frontend/
├── src/
│   ├── App.jsx                # Root component with routing
│   ├── main.jsx               # Vite entry point
│   ├── index.css              # Global styles
│   ├── App.css                # App-level styles
│   ├── components/
│   │   ├── Chatbot.jsx        # AI chatbot widget
│   │   ├── PrivateRoute.jsx   # Protected route wrapper
│   │   ├── common/
│   │   │   ├── Button.jsx     # Reusable button component
│   │   │   └── Spinner.jsx    # Loading spinner
│   │   └── layout/
│   │       ├── Navbar.jsx     # Navigation bar
│   │       ├── Footer.jsx     # Footer component
│   │       └── DashboardLayout.jsx - Dashboard wrapper
│   ├── pages/
│   │   ├── HomePage.jsx       # Landing page
│   │   ├── AboutPage.jsx      # About page
│   │   ├── LoginPage.jsx      # User login
│   │   ├── RegisterPage.jsx   # User registration
│   │   ├── DonorDashboard.jsx - Donor dashboard
│   │   ├── PatientDashboard.jsx - Patient dashboard
│   │   └── HospitalDashboard.jsx - Hospital dashboard
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.js      # Axios instance with auth intercept
│   │   │   ├── endpoints.js   # API endpoint definitions
│   │   │   └── index.js       # Barrel export
│   │   └── authService.js     # (empty - use API endpoints instead)
│   ├── utils/
│   │   ├── authUtils.js       # Token management utilities
│   │   └── locationUtils.js   # Geolocation utilities
│   ├── hooks/
│   │   └── useAuth.js         # (empty - manage auth manually or via context)
│   ├── context/
│   │   └── AuthContext.js     # (empty - can be extended for global auth state)
│   ├── constants/             # App constants (extensible)
│   └── assets/                # Images, fonts, etc.
├── public/
├── .env                       # Environment configuration
├── .env.example               # Example environment configuration
├── vite.config.js            # Vite build configuration
├── eslint.config.js          # ESLint configuration
├── index.html
├── package.json
└── .gitignore
```

### Architectural Patterns

#### 1. **Centralized API Client**
```javascript
// src/services/api/client.js configures axios with:
// - Base URL from environment variables
// - Automatic token injection in headers
// - Error handling (extensible)
```

#### 2. **API Endpoint Organization**
```javascript
// src/services/api/endpoints.js exports:
// AuthAPI, BloodRequestAPI, DonorAPI, HospitalAPI, ChatAPI
// Each grouped by feature for easy management
```

#### 3. **Utility Functions**
- `authUtils.js`: Token storage, retrieval, authentication checks
- `locationUtils.js`: Geolocation access with promise wrapper

#### 4. **Component Organization**
- **Pages**: Full-page components for routes
- **Layout**: Structural components (Navbar, Footer, DashboardLayout)
- **Common**: Reusable UI components (Button, Spinner)
- **Widgets**: Specialized components (Chatbot)

### Key Technologies

- **React 19**: UI framework
- **Vite**: Fast build tool
- **React Router 7**: Client-side routing
- **Axios**: HTTP client with auth interceptor
- **Tailwind CSS 4**: Utility-first styling
- **Lucide React**: Icon library
- **React Hot Toast**: Toast notifications

---

## Development Workflow

### Backend

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB, Twilio, Google API keys

# Start development server with hot reload
npm start
# Server runs on http://localhost:5000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Ensure .env is configured
cat .env
# VITE_API_URL=http://localhost:5000

# Start development server
npm run dev
# App runs on http://localhost:5173
```

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: Enum['donor', 'patient', 'hospital', 'admin'],
  location: {
    type: String ('Point'),
    coordinates: [longitude, latitude] // [Number]
  },
  city: String,
  bloodType: String,
  lastDonationDate: Date,
  rewards: {
    badges: [String] // ['First Donation', '5 Donations Club', 'Blood Hero']
  },
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date,
  // Index: { location: '2dsphere' }
}
```

### BloodRequests Collection
```javascript
{
  _id: ObjectId,
  requester: ObjectId (ref: User),
  acceptedBy: ObjectId (ref: User, optional),
  bloodType: String,
  unitsRequired: Number,
  hospitalName: String,
  city: String,
  status: Enum['Open', 'In Progress', 'Fulfilled', 'Closed'],
  urgency: Enum['Urgent', 'Scheduled'],
  createdAt: Date,
  updatedAt: Date
}
```

### DonationLogs Collection
```javascript
{
  _id: ObjectId,
  donor: ObjectId (ref: User),
  hospital: ObjectId (ref: User),
  bloodRequest: ObjectId (ref: BloodRequest),
  unitsDonated: Number,
  donationDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Environment Variables

### Backend (.env)
```dotenv
NODE_ENV=development
JWT_SECRET=your_long_random_secret
MONGO_URI=mongodb+srv://...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
GOOGLE_API_KEY=...
PORT=5000
```

### Frontend (.env)
```dotenv
VITE_API_URL=http://localhost:5000
VITE_APP_ENV=development
```

---

## Refactoring Rationale

### Why This Architecture?

1. **Scalability**: Services layer allows easy addition of features
2. **Testability**: Thin controllers and isolated services are easier to test
3. **Maintainability**: Clear separation of concerns reduces debugging time
4. **Reusability**: Services can be used by multiple controllers/routes
5. **Clean Code**: No circular dependencies, single responsibility principle
6. **Production Ready**: Follows industry best practices (MVC + Services)

### Migration from Old to New

- Routes: `/backend/routes/api/*.js` → `/backend/src/routes/api/*.js` (controllers + services)
- Models: `/backend/models/*.js` → `/backend/src/models/*.js`
- Middleware: `/backend/middleware/auth.js` → `/backend/src/middlewares/auth.js`
- Config: `/backend/config/db.js` → `/backend/src/config/db.js`
- Utils: `/backend/utils/*.js` → `/backend/src/utils/*.js`

**Business logic remains identical** - only code organization improved.

---

## Future Enhancements

### Backend
- [ ] Unit tests (Jest + Supertest)
- [ ] Repository pattern for abstraction
- [ ] Request validation schemas (Joi/Zod)
- [ ] Error handling middleware
- [ ] Logging system (Winston/Morgan)
- [ ] Rate limiting
- [ ] Caching layer (Redis)

### Frontend
- [ ] TypeScript
- [ ] State management (Redux, Zustand, or Jotai)
- [ ] Unit tests (Vitest + React Testing Library)
- [ ] E2E tests (Cypress)
- [ ] Form validation library (React Hook Form)
- [ ] API response error handling
- [ ] Infinite scroll / pagination

---

## Running the Project

### Prerequisites
- Node.js 16+ 
- npm or yarn
- MongoDB Atlas account
- Twilio account
- Google API key (Generative AI)

### Quick Start

```bash
# Terminal 1: Backend
cd backend
npm install
npm start

# Terminal 2: Frontend
cd frontend
npm install
npm run dev

# Access at: http://localhost:5173
# Backend API: http://localhost:5000
```

---

## File Size Comparison

| Aspect | Before | After | Improvement |
|--------|--------|-------|-------------|
| Route files | Fat routes in single file | Thin routes in src/ | Better separation |
| Entry point | Complex index.js | Clean app.js + server.js | Maintainability |
| Business logic | Routes | Services layer | Reusability |
| Folder structure | Flat + nested confusion | Clean hierarchy | Clarity |
| Import patterns | Relative with ../ | Barrel exports | Cleaner code |

---

## Conclusion

This refactored architecture transforms the project from a working prototype into a **production-grade, scalable, maintainable system**. The code is now organized according to industry best practices, making it easier to test, extend, and collaborate on.

**No business logic was changed** - only code organization improved. The API behavior, database schema, and UI remain identical.

---

**Last Updated**: February 13, 2025  
**Version**: 2.0 (Refactored)
