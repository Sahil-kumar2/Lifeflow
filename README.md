# 🩸 LifeFlow – Real-Time Blood Donation Platform

LifeFlow is a full-stack MERN web application designed to bridge the critical gap between blood donors, patients, and hospitals. It leverages real-time geolocation, automated SMS notifications, secure authentication, and gamification to create a responsive and reliable blood donation ecosystem.

---

## 🚀 Live Demo

- **Frontend (Vercel):** https://lifeflow-seven.vercel.app  
- **Backend (Render):** https://lifeflow-ghm3.onrender.com 

---

## 🌟 Key Features

### 1️⃣ Role-Based Access Control

**Donors**
- Manage profiles
- Toggle donation availability
- View nearby requests on an interactive map
- Track donation history and eligibility

**Patients**
- Create urgent blood requests
- View nearby available donors in real time
- Receive live request status updates

**Hospitals**
- Verify completed donations
- Manage blood requests
- Oversee the donation lifecycle

**Secure Authentication**
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes with role-based authorization

---

### 2️⃣ Real-Time Geolocation Matching 🗺️

- Uses MongoDB Geospatial Queries (`$geoWithin`)
- Automatically filters eligible donors within a 20 km radius

---

### 3️⃣ Automated SMS Alerts 📲

- Integrated Twilio API
- Sends instant SMS alerts to nearby donors
- Triggers notifications as soon as an urgent request is posted
- Reduces response time and manual delays

---

### 4️⃣ Gamification & Rewards 🏆

- Digital badges awarded after hospital verification:
  - First Donation
  - Blood Hero
- Eligibility countdown tracker showing next donation availability
- Encourages long-term donor engagement

---

### 5️⃣ AI-Powered Chatbot 🤖

- Powered by Google Gemini API
- Answers queries related to:
  - Blood donation eligibility
  - Platform usage
  - General FAQs
- Improves user assistance and accessibility

---

## 🛠️ Technology Stack

### Frontend
- React.js – Component-based UI
- Tailwind CSS – Utility-first responsive styling
- Vite – Fast build tool and development server

### Backend
- Node.js – JavaScript runtime
- Express.js – RESTful API framework

### Database
- MongoDB Atlas – Cloud NoSQL database with geospatial indexing

### APIs & Tools
- Twilio API – SMS notifications
- Google Maps API – Map visualization
- Google Gemini API – AI chatbot
- JWT & bcrypt – Authentication and security

---

## ⚙️ Installation & Setup

### Clone the Repository

    git clone https://github.com/your-username/lifeflow.git
    cd lifeflow

---

### Backend Setup

    cd backend
    npm install

Create a .env file inside the backend directory and add:

    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    TWILIO_ACCOUNT_SID=your_twilio_sid
    TWILIO_AUTH_TOKEN=your_twilio_auth_token
    TWILIO_PHONE_NUMBER=your_twilio_phone_number
    GEMINI_API_KEY=your_gemini_api_key

Start the backend server:

    npm start

Backend runs on:
http://localhost:5000

---

### Frontend Setup

    cd ../frontend
    npm install

Create a .env file inside the frontend directory:

    VITE_API_URL=http://localhost:5000

Start the frontend development server:

    npm run dev

Frontend runs on:
http://localhost:5173

---

## 👨‍💻 Author

Sahil Kumar
Full-Stack Developer | B.Tech Student  

LinkedIn: https://www.linkedin.com/in/sahil-kumar-873910293
GitHub: https://github.com/Sahil-kumar2

Built with ❤️ to help save lives.
