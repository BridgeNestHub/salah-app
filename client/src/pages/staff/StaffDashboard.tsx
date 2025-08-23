import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const StaffDashboard: React.FC = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    window.location.href = '/staff';
  };

  const staffFeatures = [
    {
      icon: '📅',
      title: 'My Events',
      description: 'Create and manage your events',
      link: '/staff/events',
      color: '#4f46e5'
    },
    {
      icon: '📧',
      title: 'Contact Support',
      description: 'Handle user inquiries and provide support',
      link: '/staff/contact',
      color: '#059669'
    },
    {
      icon: '🕌',
      title: 'Mosque Verification',
      description: 'Verify and moderate mosque listings',
      link: '/staff/mosques',
      color: '#dc2626'
    },
    {
      icon: '📖',
      title: 'Content Management',
      description: 'Manage Quran verses and Hadith content',
      link: '/staff/content',
      color: '#7c3aed'
    },
    {
      icon: '📢',
      title: 'Notifications',
      description: 'Send notifications to users',
      link: '/staff/notifications',
      color: '#ea580c'
    },
    {
      icon: '📊',
      title: 'Basic Analytics',
      description: 'View basic usage statistics',
      link: '/staff/analytics',
      color: '#6b7280'
    }
  ];

  return (
    <div className="admin-layout-with-nav">
      <nav className="admin-sidebar">
        <div className="admin-nav-brand">
          <h2>🕌 Staff Panel</h2>
        </div>
        <ul className="admin-nav-menu">
          <li><Link to="/staff/dashboard" className="nav-link active">📊 Dashboard</Link></li>
          <li><Link to="/staff/events" className="nav-link">📅 My Events</Link></li>
          <li><Link to="/staff/contact" className="nav-link">📧 Contact Support</Link></li>
          <li><Link to="/staff/mosques" className="nav-link">🕌 Mosque Verification</Link></li>
          <li><Link to="/staff/content" className="nav-link">📖 Content Management</Link></li>
          <li><Link to="/staff/notifications" className="nav-link">📢 Notifications</Link></li>
          <li><Link to="/staff/analytics" className="nav-link">📊 Basic Analytics</Link></li>
        </ul>
      </nav>
      
      <div className="admin-content">
        <header className="admin-page-header">
          <div>
            <h1>Staff Dashboard</h1>
            <p>Manage your assigned tasks and events</p>
          </div>
          <button onClick={handleLogout} className="btn-modern btn-secondary-modern">
            Logout
          </button>
        </header>

        <main className="admin-main">


        <div className="admin-grid">
          {staffFeatures.map((feature, index) => (
            <Link 
              key={index}
              to={feature.link} 
              className="admin-card"
              style={{ '--card-color': feature.color } as React.CSSProperties}
            >
              <div className="admin-card-icon">{feature.icon}</div>
              <div className="admin-card-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
              <div className="admin-card-arrow">→</div>
            </Link>
          ))}
        </div>
      </main>
      </div>

      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>&copy; 2024 Islamic Prayer Tools. All rights reserved.</p>
          <p>May Allah bless and guide our community.</p>
        </div>
      </footer>

      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="logout-modal-buttons">
              <button onClick={confirmLogout} className="logout-confirm-btn">
                Yes, Logout
              </button>
              <button onClick={() => setShowLogoutModal(false)} className="logout-cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;