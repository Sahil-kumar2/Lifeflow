# LifeFlow – Real-Time Blood Donation Platform

LifeFlow is a full-stack MERN web application that connects patients with nearby eligible blood donors during medical emergencies using real-time geolocation and automated notifications.

## 🔗 Live
- Frontend: https://lifeflow-seven.vercel.app
- Backend API: https://lifeflow-ghm3.onrender.com

---

## 🚀 Core Features
- Role-based access for Donors, Patients, and Hospitals
- Real-time donor discovery using geospatial queries
- Automated SMS notifications to nearby donors
- Secure authentication and authorization
- Gamification to encourage repeated donations
- AI-powered chatbot for user assistance

---

## 🧱 System Architecture
- Frontend: React + Tailwind CSS
- Backend: Node.js + Express (REST APIs)
- Database: MongoDB with geospatial indexing
- Messaging: Twilio API for SMS alerts
- Maps: Google Maps API
- AI: Google Gemini API

---

## 🧠 Key Design Decisions
- Used MongoDB geospatial indexes (`$geoWithin`) for efficient radius-based donor matching
- Implemented JWT-based authentication for stateless scalability
- Separated notification and AI logic into isolated service layers
- Role-based authorization for clear workflow separation

---

## 🛠 Tech Stack
**Frontend:** React, Tailwind CSS, Vite  
**Backend:** Node.js, Express  
**Database & Services:** MongoDB Atlas, Twilio API, Google Maps API, Google Gemini API, JWT, bcrypt  

---

## 👤 Author
**Sahil Kumar**  
B.Tech Student | Aspiring Software Development Engineer  

- GitHub: https://github.com/Sahil-kumar2  
- LinkedIn: https://www.linkedin.com/in/sahil-kumar-873910293  
- Portfolio: https://portfolio-kappa-pearl-78.vercel.app

