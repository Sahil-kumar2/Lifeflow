# Project Structure After Refactor

## Backend
```
backend/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── db.js
│   │   └── index.js
│   ├── models/
│   │   ├── User.js
│   │   ├── BloodRequest.js
│   │   ├── DonationLog.js
│   │   └── index.js
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── BloodRequestController.js
│   │   ├── DonorController.js
│   │   ├── HospitalController.js
│   │   ├── ChatController.js
│   │   └── index.js
│   ├── services/
│   │   ├── AuthService.js
│   │   ├── BloodRequestService.js
│   │   ├── DonorService.js
│   │   ├── HospitalService.js
│   │   ├── ChatService.js
│   │   └── index.js
│   ├── routes/
│   │   ├── api/
│   │   │   ├── auth.js
│   │   │   ├── requests.js
│   │   │   ├── donors.js
│   │   │   ├── hospitals.js
│   │   │   ├── chat.js
│   │   │   └── index.js
│   │   └── index.js
│   ├── middlewares/
│   │   └── auth.js
│   ├── validators/
│   ├── utils/
│   │   └── ensureIndexes.js
│   └── constants/
├── index.js
├── package.json
├── .env
├── .env.example
└── README.md
```

## Frontend
```
frontend/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── App.css
│   ├── components/
│   │   ├── Chatbot.jsx
│   │   ├── PrivateRoute.jsx
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   └── Spinner.jsx
│   │   └── layout/
│   │       ├── Navbar.jsx
│   │       ├── Footer.jsx
│   │       └── DashboardLayout.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DonorDashboard.jsx
│   │   ├── PatientDashboard.jsx
│   │   └── HospitalDashboard.jsx
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.js
│   │   │   ├── endpoints.js
│   │   │   └── index.js
│   │   └── authService.js
│   ├── utils/
│   │   ├── authUtils.js
│   │   └── locationUtils.js
│   ├── hooks/
│   │   └── useAuth.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── constants/
│   └── assets/
├── public/
├── .env
├── .env.example
├── vite.config.js
├── eslint.config.js
├── index.html
├── package.json
└── README.md
```

---

# File Moves

**Backend:**
- All business logic from `routes/api/*.js` moved to `src/controllers/` and `src/services/`.
- All models moved to `src/models/`.
- All middleware moved to `src/middlewares/`.
- All config to `src/config/`.
- All utils to `src/utils/`.
- Entry point is now `src/server.js` (with `index.js` delegating).

**Frontend:**
- API logic centralized in `src/services/api/`.
- Utility functions in `src/utils/`.
- Components, pages, layouts, hooks, and context are clearly separated.

---

# Import Example (Backend)
**Before:**
```js
const User = require('../../models/User');
const auth = require('../../middleware/auth');
```
**After:**
```js
const { User } = require('../models');
const auth = require('../middlewares/auth');
```

# Import Example (Frontend)
**Before:**
```js
import axios from 'axios';
const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, newUser);
```
**After:**
```js
import { AuthAPI } from '../services/api';
const res = await AuthAPI.register(newUser);
```

---

# Architectural Improvements
- **Separation of concerns**: Controllers, services, and models are clearly separated.
- **Thin routes**: All business logic is in services/controllers, not in routes.
- **Barrel exports**: Cleaner imports and easier refactoring.
- **Centralized config and utils**: No duplication, easier to maintain.
- **Environment variables**: Example files provided for both backend and frontend.
- **Frontend API layer**: All API calls are centralized and reusable.
- **No business logic changed**: Only structure and imports were updated.

---

# Confirmation
**No business logic, functionality, API behavior, database schema, or UI behavior was changed.**

The project is now production-grade, scalable, and maintainable.
