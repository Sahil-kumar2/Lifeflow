// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer'; // Import our new Footer
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import Chatbot from './components/Chatbot';

// Import Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage'; // Import our new About Page
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DonorDashboard from './pages/DonorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import HospitalDashboard from './pages/HospitalDashboard';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Toaster position="top-right" />
        
        <Chatbot />
        
        <Navbar /> 
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} /> {/* <-- NEW ROUTE */}
            
            {/* Protected Routes */}
            <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
              <Route path="/donor-dashboard" element={<DonorDashboard />} />
              <Route path="/patient-dashboard" element={<PatientDashboard />} />
              <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
            </Route>

            {/* Home Route */}
            <Route path="/" element={<HomePage />} />
          </Routes>
        </main>
        <Footer /> {/* <-- NEW FOOTER */}
      </div>
    </Router>
  );
}

export default App;