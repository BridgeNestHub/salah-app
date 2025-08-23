import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/public/Home';
import MosquesPage from './pages/public/MosquesPage';
import QuranPage from './pages/public/QuranPage';
import HadithPage from './pages/public/HadithPage';
import EventsPage from './pages/public/EventsPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import PrivacyPage from './pages/public/PrivacyPage';
import TermsPage from './pages/public/TermsPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEventsManagement from './pages/admin/EventsManagement';
import AdminContactManagement from './pages/admin/ContactManagement';
import AdminUserManagement from './pages/admin/UserManagement';
import AdminStaffManagement from './pages/admin/StaffManagement';
import AdminAnalytics from './pages/admin/Analytics';
import AdminSystemSettings from './pages/admin/SystemSettings';

// Staff Pages
import StaffLogin from './pages/staff/StaffLogin';
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffEventsManagement from './pages/staff/EventsManagement';
import StaffContactManagement from './pages/staff/ContactManagement';
import StaffMosqueVerification from './pages/staff/MosqueVerification';
import StaffContentManagement from './pages/staff/ContentManagement';
import StaffNotifications from './pages/staff/Notifications';
import StaffBasicAnalytics from './pages/staff/BasicAnalytics';

// Protected Route
import ProtectedRoute from './components/common/ProtectedRoute';

import './styles/index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Admin Routes - No Header/Footer */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute requiredRole="admin"><AdminEventsManagement /></ProtectedRoute>} />
          <Route path="/admin/contact" element={<ProtectedRoute requiredRole="admin"><AdminContactManagement /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUserManagement /></ProtectedRoute>} />
          <Route path="/admin/staff" element={<ProtectedRoute requiredRole="admin"><AdminStaffManagement /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSystemSettings /></ProtectedRoute>} />
          
          {/* Staff Routes - No Header/Footer */}
          <Route path="/staff" element={<StaffLogin />} />
          <Route path="/staff/dashboard" element={<ProtectedRoute requiredRole="staff"><StaffDashboard /></ProtectedRoute>} />
          <Route path="/staff/events" element={<ProtectedRoute requiredRole="staff"><StaffEventsManagement /></ProtectedRoute>} />
          <Route path="/staff/contact" element={<ProtectedRoute requiredRole="staff"><StaffContactManagement /></ProtectedRoute>} />
          <Route path="/staff/mosques" element={<ProtectedRoute requiredRole="staff"><StaffMosqueVerification /></ProtectedRoute>} />
          <Route path="/staff/content" element={<ProtectedRoute requiredRole="staff"><StaffContentManagement /></ProtectedRoute>} />
          <Route path="/staff/notifications" element={<ProtectedRoute requiredRole="staff"><StaffNotifications /></ProtectedRoute>} />
          <Route path="/staff/analytics" element={<ProtectedRoute requiredRole="staff"><StaffBasicAnalytics /></ProtectedRoute>} />
          
          {/* Public Routes - With Header/Footer */}
          <Route path="/" element={<><Header /><Home /><Footer /></>} />
          <Route path="/mosques" element={<><Header /><MosquesPage /><Footer /></>} />
          <Route path="/quran" element={<><Header /><QuranPage /><Footer /></>} />
          <Route path="/hadith" element={<><Header /><HadithPage /><Footer /></>} />
          <Route path="/events" element={<><Header /><EventsPage /><Footer /></>} />
          <Route path="/about" element={<><Header /><AboutPage /><Footer /></>} />
          <Route path="/contact" element={<><Header /><ContactPage /><Footer /></>} />
          <Route path="/privacy" element={<><Header /><PrivacyPage /><Footer /></>} />
          <Route path="/terms" element={<><Header /><TermsPage /><Footer /></>} />
          
          <Route path="*" element={<><Header /><NotFoundPage /><Footer /></>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;