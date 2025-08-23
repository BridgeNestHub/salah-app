import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    window.location.href = '/admin';
  };

  const adminFeatures = [
    {
      icon: '📅',
      title: 'Events Management',
      description: 'Create, edit, and manage all events across the platform',
      link: '/admin/events',
      color: '#4f46e5'
    },
    {
      icon: '📧',
      title: 'Contact Submissions',
      description: 'View and respond to user inquiries and feedback',
      link: '/admin/contact',
      color: '#059669'
    },
    {
      icon: '👥',
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      link: '/admin/users',
      color: '#dc2626'
    },
    {
      icon: '👨💼',
      title: 'Staff Management',
      description: 'Manage staff accounts and roles',
      link: '/admin/staff',
      color: '#7c3aed'
    },
    {
      icon: '📊',
      title: 'Analytics',
      description: 'View system analytics and usage reports',
      link: '/admin/analytics',
      color: '#ea580c'
    },
    {
      icon: '⚙️',
      title: 'System Settings',
      description: 'Configure system settings and API keys',
      link: '/admin/settings',
      color: '#6b7280'
    }
  ];

  return (
    <div className="admin-layout-with-nav">
      <nav className="admin-sidebar">
        <div className="admin-nav-brand">
          <h2>🕌 Admin Panel</h2>
        </div>
        <ul className="admin-nav-menu">
          <li><Link to="/admin/dashboard" className="nav-link active">📊 Dashboard</Link></li>
          <li><Link to="/admin/events" className="nav-link">📅 Events Management</Link></li>
          <li><Link to="/admin/contact" className="nav-link">📧 Contact Submissions</Link></li>
          <li><Link to="/admin/users" className="nav-link">👥 User Management</Link></li>
          <li><Link to="/admin/staff" className="nav-link">👨💼 Staff Management</Link></li>
          <li><Link to="/admin/analytics" className="nav-link">📊 Analytics</Link></li>
          <li><Link to="/admin/settings" className="nav-link">⚙️ System Settings</Link></li>
        </ul>
      </nav>
      
      <div className="admin-content">
        <header className="admin-page-header">
          <h1>Admin Dashboard</h1>
          <p>Manage all aspects of the Islamic Prayer Tools platform</p>
        </header>

        <main className="admin-main">
          <div className="admin-grid">
          {adminFeatures.map((feature, index) => (
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

export default AdminDashboard;